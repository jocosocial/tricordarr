package com.tricordarr

import android.app.KeyguardManager
import android.content.Context
import android.os.Build
import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import expo.modules.ReactActivityDelegateWrapper

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   *
   * This has to case-match with what we put as the "name" value in `app.json`.
   */
  override fun getMainComponentName(): String = "Tricordarr"

  /**
   * Allow this activity to be shown over the lock screen.
   *
   * An incoming KrakenTalk call posts a full-screen intent that launches this activity. Without
   * these flags the system would show the heads-up notification but the activity itself would sit
   * behind the keyguard, so the user would never see the answer/decline UI on a locked device.
   * The keyguard itself is only dismissed once the user actually answers, via
   * [dismissKeyguardForCall].
   */
  override fun onCreate(savedInstanceState: Bundle?) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      setShowWhenLocked(true)
      setTurnScreenOn(true)
    } else {
      @Suppress("DEPRECATION")
      window.addFlags(
          android.view.WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
              android.view.WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON)
    }
    super.onCreate(savedInstanceState)
  }

  /**
   * Ask the system to dismiss the keyguard, so that answering a call from the lock screen lands
   * the user in the app rather than behind a PIN prompt. On a secured device this prompts for
   * credentials; on an unsecured one it dismisses immediately.
   */
  fun dismissKeyguardForCall() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      val keyguardManager = getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
      keyguardManager.requestDismissKeyguard(this, null)
    }
  }

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      ReactActivityDelegateWrapper(this, BuildConfig.IS_NEW_ARCHITECTURE_ENABLED, DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled))
}
