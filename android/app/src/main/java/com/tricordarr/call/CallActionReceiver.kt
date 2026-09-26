package com.tricordarr.call

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import java.net.HttpURLConnection
import java.net.URL
import kotlin.concurrent.thread

/**
 * Handles the Decline and Hang Up buttons on the KrakenTalk call notification.
 *
 * These are deliberately handled in native code rather than by waking the JS runtime. Declining a
 * call from the lock screen has to work when the app has been swiped away, and starting a headless
 * JS context to send one HTTP request is both slow and unreliable in exactly that situation. The
 * credentials come from [CallCredentials], written by the JS side whenever the session changes.
 *
 * Swiftarr uses the same `decline` endpoint for declining a ringing call and for hanging up an
 * established one, so both actions post to the same place.
 */
class CallActionReceiver : BroadcastReceiver() {

  override fun onReceive(context: Context, intent: Intent) {
    val callID = intent.getStringExtra(EXTRA_CALL_ID)
    if (callID.isNullOrEmpty()) {
      Log.w(TAG, "Received ${intent.action} with no call ID")
      return
    }

    when (intent.action) {
      ACTION_DECLINE, ACTION_HANG_UP -> {
        Log.d(TAG, "Handling ${intent.action} for call $callID")
        // Clear the UI immediately so the notification does not linger behind the network call.
        CallNotifications.cancel(context)
        CallService.stop(context)
        postDecline(context.applicationContext, callID)
      }
      else -> Log.w(TAG, "Ignoring unknown action ${intent.action}")
    }
  }

  /**
   * POST /phone/decline/{callID}. Runs off the main thread because onReceive() must return
   * promptly; the result is advisory, so failures are logged rather than retried. If the request
   * does not land, the server tears the call down when the caller's socket closes.
   */
  private fun postDecline(context: Context, callID: String) {
    val baseUrl = CallCredentials.serverUrl(context)
    val token = CallCredentials.token(context)
    if (baseUrl.isNullOrEmpty() || token.isNullOrEmpty()) {
      Log.w(TAG, "No stored credentials; cannot decline call $callID from native")
      return
    }

    thread(start = true) {
      var connection: HttpURLConnection? = null
      try {
        val url = URL("${baseUrl.trimEnd('/')}/phone/decline/$callID")
        connection =
            (url.openConnection() as HttpURLConnection).apply {
              requestMethod = "POST"
              setRequestProperty("Authorization", "Bearer $token")
              setRequestProperty("Content-Length", "0")
              connectTimeout = REQUEST_TIMEOUT_MS
              readTimeout = REQUEST_TIMEOUT_MS
              doOutput = true
            }
        connection.outputStream.close()
        Log.d(TAG, "Decline for $callID returned ${connection.responseCode}")
      } catch (e: Exception) {
        Log.e(TAG, "Failed to decline call $callID: ${e.message}")
      } finally {
        connection?.disconnect()
      }
    }
  }

  companion object {
    private const val TAG = "CallActionReceiver"
    private const val REQUEST_TIMEOUT_MS = 10000

    const val ACTION_DECLINE = "com.tricordarr.call.DECLINE"
    const val ACTION_HANG_UP = "com.tricordarr.call.HANG_UP"
    const val EXTRA_CALL_ID = "callID"
  }
}
