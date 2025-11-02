package com.tricordarr.nativemodule

import com.facebook.react.bridge.Callback
import android.content.Context
import android.content.SharedPreferences
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import android.util.Log

// This get codegen'd from specs/NativeTricordarrModule.ts.
import com.tricordarr.nativemodule.NativeTricordarrModuleSpec

/*
 * This is a monolithic module for any native code that is needed in the app. Since patterns of multiple
 * native modules in a single repo are not super well documented yet we're gonna do this until that sorts
 * itself out.
 *
 * The big features we are likely to need here are:
 * - Photostream image text blurring
 * - Audio calling???
 *
 * "In general" modules are created the first time they are accessed and stick around.
 * https://reactnative.dev/docs/next/the-new-architecture/native-modules-lifecycle
 */
class NativeTricordarrModule(reactContext: ReactApplicationContext) : NativeTricordarrModuleSpec(reactContext) {

  override fun getName() = NAME

  // Loads the image file specified by `name` from the local fs, crops the image to a square,
  // uses OCR to scan the image for text, blurs any discovered text areas, saves the image to
  // the temp directory. Calls the callback with the path of the processed image, or if an error occurs,
  // calls the callback with the original file path.
  override fun blurTextInImage(inputFilePath: String, callback: Callback) {
    ImageBlur.blurTextInImage(inputFilePath, callback)
  }

  override fun setupLocalPushManager(
    socketUrl: String,
    token: String,
    wifiNetworkNames: ReadableArray,
    healthcheckTimer: Double,
    enable: Boolean,
  ) {
    Log.d(NAME, "setupLocalPushManager is a no-op on Android")
  }

  // Kotlin doesn't have "static" like Java so this does a similar thing of making class members.
  // The name needs to match what gets registered in the JavaScript spec side.
  companion object {
    const val NAME = "NativeTricordarrModule"
  }
}
