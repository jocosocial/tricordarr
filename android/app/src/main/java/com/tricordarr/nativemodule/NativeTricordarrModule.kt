package com.tricordarr.nativemodule

import com.facebook.react.bridge.Callback
import android.content.Context
import android.content.SharedPreferences
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments
import android.util.Log
import com.tricordarr.push.AccountStatus
import com.tricordarr.push.NotificationBuilder
import com.tricordarr.push.PushAccount
import com.tricordarr.push.PushAccountStore
import com.tricordarr.push.PushEvents
import com.tricordarr.push.PushServiceController
import com.tricordarr.push.PushStatusStore
import com.tricordarr.push.SocketState
import com.tricordarr.push.TwitarrPushService

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

  // The push service runs without a React context, so it reports through this singleton instead of
  // holding a module reference. Events fired while no module exists are dropped; JS pulls status.
  private val pushListener = object : PushEvents.Listener {
    override fun onNotificationSocketEvent(accountID: String, raw: String) {
      emitOnNotificationSocketEvent(Arguments.createMap().apply {
        putString("accountID", accountID)
        putString("raw", raw)
      })
    }

    override fun onBackgroundStatusChanged(status: AccountStatus) {
      emitOnBackgroundStatusChanged(Arguments.createMap().apply {
        putString("accountID", status.accountID)
        putString("status", status.toJson().toString())
      })
    }

    override fun onMarkAsRead(accountID: String, contentID: String) {
      emitOnMarkAsRead(Arguments.createMap().apply {
        putString("accountID", accountID)
        putString("contentID", contentID)
      })
    }
  }

  override fun initialize() {
    super.initialize()
    PushEvents.listener = pushListener
  }

  override fun invalidate() {
    if (PushEvents.listener === pushListener) {
      PushEvents.listener = null
    }
    super.invalidate()
  }

  // Loads the image file specified by `name` from the local fs, crops the image to a square,
  // uses OCR to scan the image for text, blurs any discovered text areas, saves the image to
  // the temp directory. Calls the callback with the path of the processed image, or if an error occurs,
  // calls the callback with the original file path.
  override fun blurTextInImage(inputFilePath: String, callback: Callback) {
    ImageBlur.blurTextInImage(inputFilePath, callback)
  }

  override fun setAppConfig(appConfigJson: String) {
    Log.d(NAME, "setAppConfig is a no-op on Android")
  }

  override fun getBackgroundPushManagerStatus(promise: Promise) {
    Log.d(NAME, "getBackgroundPushManagerStatus is a no-op on Android")
    val result: WritableMap = Arguments.createMap()
    result.putArray("matchSSIDs", Arguments.createArray())
    promise.resolve(result)
  }

  override fun getForegroundPushProviderStatus(promise: Promise) {
    Log.d(NAME, "getForegroundPushProviderStatus is a no-op on Android")
    val result: WritableMap = Arguments.createMap()
    promise.resolve(result)
  }

  // Native is the source of truth for status. The persisted state is only trusted while the
  // service is alive in this process; otherwise whatever it last wrote is stale.
  override fun getWebsocketStatus(promise: Promise) {
    try {
      val statuses = PushStatusStore(reactApplicationContext).all().map { status ->
        if (!TwitarrPushService.running && status.state != SocketState.REVOKED) {
          status.copy(state = SocketState.STOPPED)
        } else {
          status
        }
      }
      val result = Arguments.createArray()
      statuses.forEach { result.pushMap(Arguments.makeNativeMap(jsonToMap(it))) }
      promise.resolve(result)
    } catch (e: Exception) {
      promise.reject("E_STATUS", e)
    }
  }

  private fun jsonToMap(status: AccountStatus): Map<String, Any?> {
    val json = status.toJson()
    return json.keys().asSequence().associateWith { json.get(it) }
  }

  override fun syncPushAccounts(accountsJson: String) {
    try {
      val accounts = PushAccount.listFromJson(accountsJson)
      PushAccountStore(reactApplicationContext).save(accounts)
      PushStatusStore(reactApplicationContext).retainOnly(accounts.map { it.accountID }.toSet())
      // A running service picks the change up on its next reconcile (30s). Nudge it now so a
      // sign-out or token change takes effect immediately.
      if (TwitarrPushService.running) {
        PushServiceController.start(reactApplicationContext)
      }
    } catch (e: Exception) {
      Log.e(NAME, "syncPushAccounts failed", e)
    }
  }

  override fun setPushAccountEnabled(accountID: String, enabled: Boolean) {
    try {
      val store = PushAccountStore(reactApplicationContext)
      store.save(store.load().map { if (it.accountID == accountID) it.copy(enabled = enabled) else it })
      if (TwitarrPushService.running) {
        PushServiceController.start(reactApplicationContext)
      }
    } catch (e: Exception) {
      Log.e(NAME, "setPushAccountEnabled failed", e)
    }
  }

  override fun startBackgroundService() {
    PushServiceController.startIfConfigured(reactApplicationContext)
  }

  override fun stopBackgroundService() {
    PushServiceController.stop(reactApplicationContext)
  }

  override fun cancelContentNotification(accountID: String, contentID: String) {
    NotificationBuilder.cancelContent(reactApplicationContext, accountID, contentID)
  }

  override fun cancelSecondaryNotifications(accountID: String, secondaryContentID: String) {
    NotificationBuilder.cancelSecondary(reactApplicationContext, accountID, secondaryContentID)
  }

  // On Android the native push service appends `fgs` entries to the same JSONL file JS reads
  // directly (see src/Libraries/NotificationLog/index.ts and push/NotificationLogWriter.kt), so
  // these stay no-ops. They exist for the iOS-only App Group log.
  override fun getNotificationLog(promise: Promise) {
    Log.d(NAME, "getNotificationLog is a no-op on Android")
    promise.resolve("")
  }

  override fun clearNotificationLog() {
    Log.d(NAME, "clearNotificationLog is a no-op on Android")
  }

  // Kotlin doesn't have "static" like Java so this does a similar thing of making class members.
  // The name needs to match what gets registered in the JavaScript spec side.
  companion object {
    const val NAME = "NativeTricordarrModule"
  }
}
