package com.tricordarr.nativemodule

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.tricordarr.AudioEngineModule

class NativeTricordarrPackage : BaseReactPackage() {

  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? =
    when (name) {
      NativeTricordarrModule.NAME -> NativeTricordarrModule(reactContext)
      "AudioEngine" -> AudioEngineModule(reactContext)
      else -> null
    }

  override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
    mapOf(
      NativeTricordarrModule.NAME to ReactModuleInfo(
        name = NativeTricordarrModule.NAME,
        className = NativeTricordarrModule.NAME,
        canOverrideExistingModule = false,
        needsEagerInit = false,
        isCxxModule = false,
        isTurboModule = true
      ),
      "AudioEngine" to ReactModuleInfo(
        name = "AudioEngine",
        className = "AudioEngine",
        canOverrideExistingModule = false,
        needsEagerInit = false,
        isCxxModule = false,
        isTurboModule = true
      )
    )
  }
}