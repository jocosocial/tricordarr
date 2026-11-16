package com.tricordarr.push

import android.content.Context
import android.content.Intent
import android.util.Log
import androidx.core.content.ContextCompat

/** Starts, updates and stops [CallService] for the duration of a call. */
object CallServiceController {
  private const val TAG = "CallServiceController"
  const val EXTRA_REMOTE_USERNAME = "remoteUsername"
  const val EXTRA_STARTED_AT = "startedAt"
  const val EXTRA_MUTED = "muted"

  /**
   * Shows the call notification, starting the service if it is not already running. A running
   * service is updated in place, because Android refuses a foreground start from the background.
   */
  fun show(context: Context, remoteUsername: String, startedAtMs: Long, muted: Boolean) {
    if (CallService.running) {
      NotificationBuilder.updateCallNotification(context, remoteUsername, startedAtMs, muted)
      return
    }
    val intent = Intent(context, CallService::class.java)
      .putExtra(EXTRA_REMOTE_USERNAME, remoteUsername)
      .putExtra(EXTRA_STARTED_AT, startedAtMs)
      .putExtra(EXTRA_MUTED, muted)
    try {
      ContextCompat.startForegroundService(context, intent)
    } catch (e: IllegalStateException) {
      Log.w(TAG, "Call service start was not allowed", e)
    }
  }

  /** Stops the service and removes the notification. Safe to call when no call is showing. */
  fun dismiss(context: Context) {
    context.stopService(Intent(context, CallService::class.java))
    NotificationBuilder.cancelCallNotification(context)
  }
}
