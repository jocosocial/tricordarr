package com.tricordarr.call

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioDeviceInfo
import android.media.AudioFocusRequest
import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioRecord
import android.media.AudioTrack
import android.media.MediaRecorder
import android.os.Build
import android.util.Log
import kotlin.concurrent.thread

/**
 * Owns the microphone capture and playback streams for a KrakenTalk call, along with the audio
 * focus, audio mode and output routing that have to move in lockstep with them.
 *
 * This is a process-wide singleton rather than a field on the TurboModule because its lifetime is
 * owned by [CallService]: the service starts it before calling startForeground() and stops it in
 * onDestroy(), so capture can never outlive the foreground service that legitimises it. The
 * TurboModule is only a bridge for per-call controls (mute, speaker) and for handing captured
 * samples to JS.
 *
 * Ordering matters here and is the fix for two separate bugs. Audio focus and MODE_IN_COMMUNICATION
 * are established *before* AudioRecord/AudioTrack are constructed, because requesting focus is what
 * makes other apps pause rather than duck (#472), and because changing the audio mode underneath
 * live streams forces a HAL restart that can drop the capture stream (#433).
 */
object CallAudioEngine {
  private const val TAG = "CallAudioEngine"

  // Audio configuration matching server requirements.
  private const val SAMPLE_RATE = 16000
  private const val CHANNEL_CONFIG = AudioFormat.CHANNEL_IN_MONO
  private const val AUDIO_FORMAT = AudioFormat.ENCODING_PCM_16BIT
  private const val AMPLIFICATION_FACTOR = 4.0f

  private var audioRecord: AudioRecord? = null
  private var audioTrack: AudioTrack? = null
  private var recordingThread: Thread? = null
  private var focusRequest: AudioFocusRequest? = null

  @Volatile private var isRunning = false
  @Volatile private var isMuted = false
  @Volatile private var speakerOn = false

  /** Set by the TurboModule to forward captured microphone samples to JavaScript. */
  @Volatile var onAudioData: ((IntArray) -> Unit)? = null

  /** True while the capture/playback streams are live. */
  fun isActive(): Boolean = isRunning

  private fun audioManager(context: Context) =
      context.getSystemService(Context.AUDIO_SERVICE) as AudioManager

  /**
   * Acquire transient audio focus for the call.
   *
   * AUDIOFOCUS_GAIN_TRANSIENT delivers AUDIOFOCUS_LOSS_TRANSIENT to whatever is currently playing,
   * which is what makes a well-behaved media app pause and then resume when we abandon focus.
   * AUDIOFOCUS_GAIN would deliver a permanent AUDIOFOCUS_LOSS and media would not come back;
   * AUDIOFOCUS_GAIN_TRANSIENT_EXCLUSIVE would additionally suppress other apps' notification
   * sounds and text-to-speech for the whole call, which is too blunt for something that can run
   * for many minutes.
   */
  private fun acquireAudioFocus(context: Context): Boolean {
    val manager = audioManager(context)
    val granted =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
          val attributes =
              AudioAttributes.Builder()
                  .setUsage(AudioAttributes.USAGE_VOICE_COMMUNICATION)
                  .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                  .build()
          val request =
              AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT)
                  .setAudioAttributes(attributes)
                  .setOnAudioFocusChangeListener { change ->
                    Log.d(TAG, "Audio focus changed: $change")
                  }
                  .build()
          focusRequest = request
          manager.requestAudioFocus(request)
        } else {
          @Suppress("DEPRECATION")
          manager.requestAudioFocus(
              { change -> Log.d(TAG, "Audio focus changed: $change") },
              AudioManager.STREAM_VOICE_CALL,
              AudioManager.AUDIOFOCUS_GAIN_TRANSIENT)
        }
    val ok = granted == AudioManager.AUDIOFOCUS_REQUEST_GRANTED
    Log.d(TAG, "Audio focus request granted=$ok")
    return ok
  }

  private fun releaseAudioFocus(context: Context) {
    val manager = audioManager(context)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      focusRequest?.let { manager.abandonAudioFocusRequest(it) }
    } else {
      @Suppress("DEPRECATION") manager.abandonAudioFocus(null)
    }
    focusRequest = null
  }

  /**
   * Route call audio to the speakerphone or back to the default communication device.
   *
   * Deliberately does not touch AudioManager.mode: the mode is set once in [start] and changing it
   * again while AudioRecord/AudioTrack are live is what made the old implementation drop the
   * stream on toggle. setCommunicationDevice() also only takes effect once the mode is already
   * MODE_IN_COMMUNICATION, so the ordering in [start] is a requirement rather than a convention.
   */
  fun setSpeakerOn(context: Context, enabled: Boolean) {
    speakerOn = enabled
    val manager = audioManager(context)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      if (enabled) {
        // availableCommunicationDevices can be transiently empty right after a mode change.
        val speaker =
            manager.availableCommunicationDevices.firstOrNull {
              it.type == AudioDeviceInfo.TYPE_BUILTIN_SPEAKER
            }
        if (speaker == null) {
          Log.w(TAG, "No built-in speaker in availableCommunicationDevices; leaving route alone")
          return
        }
        // Returns false if the platform rejects the request, e.g. when the mode has not settled.
        if (!manager.setCommunicationDevice(speaker)) {
          Log.w(TAG, "setCommunicationDevice(speaker) was rejected")
        }
      } else {
        // Reverts to the platform default for the current mode. Note that with a Bluetooth headset
        // connected that default is the headset, not the earpiece.
        manager.clearCommunicationDevice()
      }
    } else {
      @Suppress("DEPRECATION")
      manager.isSpeakerphoneOn = enabled
    }
    Log.d(TAG, "Speaker mode: $enabled")
  }

  /** Stop sending captured microphone samples upstream without tearing down the stream. */
  fun setMuted(muted: Boolean) {
    isMuted = muted
    Log.d(TAG, "Microphone ${if (muted) "muted" else "unmuted"}")
  }

  /** Queue decoded samples received from the far end for playback. */
  fun playAudio(samples: ShortArray) {
    val track = audioTrack
    if (track == null) {
      Log.d(TAG, "Cannot play audio - engine not initialized")
      return
    }
    track.write(samples, 0, samples.size)
  }

  /**
   * Acquire focus and routing, then start capture and playback. Safe to call twice; the second
   * call is a no-op.
   */
  @Synchronized
  fun start(context: Context) {
    if (isRunning) {
      Log.d(TAG, "Already running")
      return
    }

    // Establish focus and mode BEFORE the streams exist. See the class docstring.
    val manager = audioManager(context)
    manager.mode = AudioManager.MODE_IN_COMMUNICATION
    if (!acquireAudioFocus(context)) {
      // Not fatal: the user asked for a call and should get one even if another app is holding
      // focus in a way the platform will not preempt.
      Log.w(TAG, "Proceeding without audio focus")
    }

    val minBufferSize = AudioRecord.getMinBufferSize(SAMPLE_RATE, CHANNEL_CONFIG, AUDIO_FORMAT)
    if (minBufferSize == AudioRecord.ERROR || minBufferSize == AudioRecord.ERROR_BAD_VALUE) {
      throw IllegalStateException("Invalid buffer size")
    }
    val bufferSize = minBufferSize * 2

    val record =
        AudioRecord(
            MediaRecorder.AudioSource.VOICE_COMMUNICATION,
            SAMPLE_RATE,
            CHANNEL_CONFIG,
            AUDIO_FORMAT,
            bufferSize)
    if (record.state != AudioRecord.STATE_INITIALIZED) {
      record.release()
      throw IllegalStateException("Failed to initialize AudioRecord")
    }
    audioRecord = record

    val playbackBufferSize =
        AudioTrack.getMinBufferSize(SAMPLE_RATE, AudioFormat.CHANNEL_OUT_MONO, AUDIO_FORMAT)
    val track =
        AudioTrack(
            AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_VOICE_COMMUNICATION)
                .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                .build(),
            AudioFormat.Builder()
                .setSampleRate(SAMPLE_RATE)
                .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                .setEncoding(AUDIO_FORMAT)
                .build(),
            playbackBufferSize,
            AudioTrack.MODE_STREAM,
            AudioManager.AUDIO_SESSION_ID_GENERATE)
    if (track.state != AudioTrack.STATE_INITIALIZED) {
      track.release()
      record.release()
      audioRecord = null
      throw IllegalStateException("Failed to initialize AudioTrack")
    }
    audioTrack = track

    record.startRecording()
    track.play()
    isRunning = true

    // Apply whatever route the UI last asked for, now that the streams exist.
    setSpeakerOn(context, speakerOn)

    recordingThread = thread(start = true) { captureAudioLoop(bufferSize) }
    Log.d(TAG, "Started successfully at ${SAMPLE_RATE}Hz")
  }

  /**
   * Tear down capture and playback, then hand audio focus and the audio mode back to the system so
   * that whatever we interrupted can resume.
   */
  @Synchronized
  fun stop(context: Context) {
    if (!isRunning) {
      return
    }
    isRunning = false

    recordingThread?.interrupt()
    recordingThread = null

    audioRecord?.apply {
      stop()
      release()
    }
    audioRecord = null

    audioTrack?.apply {
      stop()
      release()
    }
    audioTrack = null

    val manager = audioManager(context)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      manager.clearCommunicationDevice()
    } else {
      @Suppress("DEPRECATION")
      manager.isSpeakerphoneOn = false
    }
    speakerOn = false
    isMuted = false

    // Restore MODE_NORMAL explicitly rather than saving and restoring the previous mode. Older
    // builds of this app leaked MODE_IN_COMMUNICATION past the end of a call, so a save/restore
    // would read the leaked value as "previous" and cement it forever.
    manager.mode = AudioManager.MODE_NORMAL
    releaseAudioFocus(context)

    Log.d(TAG, "Stopped")
  }

  private fun captureAudioLoop(bufferSize: Int) {
    val buffer = ShortArray(bufferSize)

    while (isRunning) {
      try {
        val record = audioRecord ?: break
        val readResult = record.read(buffer, 0, bufferSize)

        if (readResult > 0 && !isMuted) {
          val amplifiedSamples =
              IntArray(readResult) { i ->
                val amplified = buffer[i].toFloat() * AMPLIFICATION_FACTOR
                amplified.coerceIn(-32768f, 32767f).toInt()
              }
          onAudioData?.invoke(amplifiedSamples)
        }
      } catch (e: InterruptedException) {
        break
      } catch (e: Exception) {
        Log.e(TAG, "Error in capture loop: ${e.message}")
      }
    }
  }
}
