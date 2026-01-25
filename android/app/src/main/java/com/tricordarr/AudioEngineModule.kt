package com.tricordarr

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioRecord
import android.media.AudioTrack
import android.media.MediaRecorder
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import kotlin.concurrent.thread

class AudioEngineModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var audioRecord: AudioRecord? = null
    private var audioTrack: AudioTrack? = null
    private var recordingThread: Thread? = null
    private var isRunning = false
    private var isMuted = false

    // Audio configuration matching server requirements
    private val sampleRate = 16000
    private val channelConfig = AudioFormat.CHANNEL_IN_MONO
    private val audioFormat = AudioFormat.ENCODING_PCM_16BIT
    private val amplificationFactor = 4.0f

    override fun getName(): String = "AudioEngine"

    @ReactMethod
    fun start(promise: Promise) {
        try {
            startAudioEngine()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("START_ERROR", "Failed to start audio engine: ${e.message}", e)
        }
    }

    @ReactMethod
    fun stop(promise: Promise) {
        stopAudioEngine()
        promise.resolve(true)
    }

    @ReactMethod
    fun setMuted(muted: Boolean, promise: Promise) {
        isMuted = muted
        println("[AudioEngine] Microphone ${if (muted) "muted" else "unmuted"}")
        promise.resolve(true)
    }

    @ReactMethod
    fun setSpeakerOn(speakerOn: Boolean, promise: Promise) {
        try {
            val audioManager = reactApplicationContext.getSystemService(
                Context.AUDIO_SERVICE
            ) as AudioManager

            audioManager.mode = AudioManager.MODE_IN_COMMUNICATION
            audioManager.isSpeakerphoneOn = speakerOn

            println("[AudioEngine] Speaker mode: $speakerOn")
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SPEAKER_ERROR", "Failed to set speaker mode: ${e.message}", e)
        }
    }

    @ReactMethod
    fun playAudio(audioData: ReadableArray) {
        val track = audioTrack ?: run {
            println("[AudioEngine] Cannot play audio - engine not initialized")
            return
        }

        // Convert ReadableArray to ShortArray
        val samples = ShortArray(audioData.size()) { i ->
            audioData.getInt(i).toShort()
        }

        // Write samples to audio track
        track.write(samples, 0, samples.size)
    }

    private fun startAudioEngine() {
        if (isRunning) {
            println("[AudioEngine] Already running")
            return
        }

        // Calculate buffer sizes
        val minBufferSize = AudioRecord.getMinBufferSize(
            sampleRate,
            channelConfig,
            audioFormat
        )

        if (minBufferSize == AudioRecord.ERROR || minBufferSize == AudioRecord.ERROR_BAD_VALUE) {
            throw IllegalStateException("Invalid buffer size")
        }

        val bufferSize = minBufferSize * 2

        // Create AudioRecord for microphone capture
        audioRecord = AudioRecord(
            MediaRecorder.AudioSource.VOICE_COMMUNICATION,
            sampleRate,
            channelConfig,
            audioFormat,
            bufferSize
        )

        if (audioRecord?.state != AudioRecord.STATE_INITIALIZED) {
            throw IllegalStateException("Failed to initialize AudioRecord")
        }

        // Create AudioTrack for playback
        val playbackBufferSize = AudioTrack.getMinBufferSize(
            sampleRate,
            AudioFormat.CHANNEL_OUT_MONO,
            audioFormat
        )

        audioTrack = AudioTrack(
            AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_VOICE_COMMUNICATION)
                .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                .build(),
            AudioFormat.Builder()
                .setSampleRate(sampleRate)
                .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                .setEncoding(audioFormat)
                .build(),
            playbackBufferSize,
            AudioTrack.MODE_STREAM,
            AudioManager.AUDIO_SESSION_ID_GENERATE
        )

        if (audioTrack?.state != AudioTrack.STATE_INITIALIZED) {
            throw IllegalStateException("Failed to initialize AudioTrack")
        }

        // Start recording and playback
        audioRecord?.startRecording()
        audioTrack?.play()

        isRunning = true

        // Start background thread for audio capture
        recordingThread = thread(start = true) {
            captureAudioLoop(bufferSize)
        }

        println("[AudioEngine] Started successfully at ${sampleRate}Hz")
    }

    private fun stopAudioEngine() {
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

        println("[AudioEngine] Stopped")
    }

    private fun captureAudioLoop(bufferSize: Int) {
        val buffer = ShortArray(bufferSize)

        while (isRunning) {
            try {
                val record = audioRecord ?: break

                val readResult = record.read(buffer, 0, bufferSize)

                if (readResult > 0 && !isMuted) {
                    // Amplify and clamp samples
                    val amplifiedSamples = IntArray(readResult) { i ->
                        val sample = buffer[i].toFloat()
                        val amplified = sample * amplificationFactor
                        val clamped = amplified.coerceIn(-32768f, 32767f)
                        clamped.toInt()
                    }

                    // Send to JavaScript
                    sendAudioData(amplifiedSamples)
                }
            } catch (e: InterruptedException) {
                break
            } catch (e: Exception) {
                println("[AudioEngine] Error in capture loop: ${e.message}")
            }
        }
    }

    private fun sendAudioData(samples: IntArray) {
        val params = Arguments.createMap()
        val array = Arguments.createArray()

        for (sample in samples) {
            array.pushInt(sample)
        }

        params.putArray("samples", array)

        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("onAudioData", params)
    }
}
