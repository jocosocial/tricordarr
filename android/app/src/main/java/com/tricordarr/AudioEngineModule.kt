package com.tricordarr

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.tricordarr.call.CallAudioEngine
import com.tricordarr.call.CallNotifications
import com.tricordarr.call.CallService
import com.tricordarr.nativemodule.NativeAudioEngineSpec

/**
 * Bridge between JavaScript and the native call audio stack.
 *
 * The audio streams, audio focus and routing all live in [CallAudioEngine], whose lifetime is
 * owned by [CallService]. This module only starts and stops that service, forwards per-call
 * controls, and pumps captured microphone samples up to JS. Keeping the streams out of the module
 * matters because a TurboModule has no lifecycle tie to a foreground service, and on Android 14+
 * microphone capture is only permitted while such a service is running.
 */
class AudioEngineModule(reactContext: ReactApplicationContext) :
    NativeAudioEngineSpec(reactContext) {

  override fun getName(): String = "AudioEngine"

  init {
    // Captured samples are emitted from CallAudioEngine's recording thread.
    CallAudioEngine.onAudioData = { samples -> sendAudioData(samples) }
    // Create the call channels up front rather than waiting for the first call, so that the legacy
    // JS-created channels this replaces are deleted promptly after an upgrade.
    CallNotifications.ensureChannels(reactContext)
  }

  override fun start(
      callID: String,
      callerName: String,
      startTimeMs: Double,
      promise: Promise
  ) {
    try {
      // The service starts the audio engine once it is in the foreground, so that capture never
      // begins before the foreground service that permits it.
      CallService.start(reactApplicationContext, callID, callerName, startTimeMs.toLong())
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("START_ERROR", "Failed to start call service: ${e.message}", e)
    }
  }

  override fun stop(promise: Promise) {
    CallService.stop(reactApplicationContext)
    promise.resolve(true)
  }

  override fun setMuted(muted: Boolean, promise: Promise) {
    CallAudioEngine.setMuted(muted)
    // Keep the in-call notification's "Muted" subtext in step with the engine.
    CallService.update(reactApplicationContext, muted)
    promise.resolve(true)
  }

  override fun setSpeakerOn(speakerOn: Boolean, promise: Promise) {
    try {
      CallAudioEngine.setSpeakerOn(reactApplicationContext, speakerOn)
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("SPEAKER_ERROR", "Failed to set speaker mode: ${e.message}", e)
    }
  }

  override fun playAudio(audioData: ReadableArray) {
    val samples = ShortArray(audioData.size()) { i -> audioData.getInt(i).toShort() }
    CallAudioEngine.playAudio(samples)
  }

  override fun showIncomingCall(callID: String, callerName: String, callerUserID: String) {
    CallNotifications.showIncoming(reactApplicationContext, callID, callerName, callerUserID)
  }

  override fun dismissCallNotification() {
    CallNotifications.cancel(reactApplicationContext)
  }

  override fun addListener(eventName: String) {
    // Required by TurboModule spec for event support. No-op.
  }

  override fun removeListeners(count: Double) {
    // Required by TurboModule spec for event support. No-op.
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
