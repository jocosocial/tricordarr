package com.tricordarr.push

import android.content.Context
import android.content.Intent
import android.util.Log
import androidx.core.content.ContextCompat

/** Starts and stops [TwitarrPushService], handling the cases Android refuses a foreground start. */
object PushServiceController {
  private const val TAG = "PushServiceController"

  /**
   * Starts the service. Returns false if Android refused (background FGS starts are blocked on
   * API 31+ except from boot, a notification tap, or with battery optimization off), in which case
   * a "tap to reconnect" notification has been posted.
   */
  fun start(context: Context): Boolean =
    try {
      ContextCompat.startForegroundService(context, Intent(context, TwitarrPushService::class.java))
      true
    } catch (e: IllegalStateException) {
      Log.w(TAG, "Foreground service start was not allowed", e)
      NotificationBuilder.postReconnectNeeded(context)
      false
    }

  /** Starts the service only if the store has an enabled account. Used by boot and package-replaced. */
  fun startIfConfigured(context: Context): Boolean {
    if (PushAccountStore(context).load().none { it.enabled }) {
      return false
    }
    return start(context)
  }

  fun stop(context: Context) {
    context.stopService(Intent(context, TwitarrPushService::class.java))
    NotificationBuilder.cancelConnectionLost(context)
    NotificationBuilder.cancelReconnectNeeded(context)
    // The service's onDestroy only runs if it was alive in this process.
    val statusStore = PushStatusStore(context)
    statusStore.all().forEach { statusStore.put(it.copy(state = SocketState.STOPPED)) }
  }
}
