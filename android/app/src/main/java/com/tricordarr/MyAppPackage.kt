package com.tricordarr

import android.view.View
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ReactShadowNode
import com.facebook.react.uimanager.ViewManager

/**
 * TODO: This is relying on an interop layer for an old-style native module.
 * Some day we're gonna need to move to the new Turbo style modules.
 * https://reactnative.dev/docs/turbo-native-modules-introduction
 */
class MyAppPackage : ReactPackage {

  override fun createViewManagers(reactContext: ReactApplicationContext):
    MutableList<ViewManager<View, ReactShadowNode<*>>> = mutableListOf()

  override fun createNativeModules(reactContext: ReactApplicationContext):
    MutableList<NativeModule> = listOf(ImageTextBlurModule(reactContext)).toMutableList()
}
