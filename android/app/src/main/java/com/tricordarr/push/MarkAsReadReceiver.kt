package com.tricordarr.push

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import okhttp3.Request

/**
 * Handles the "Mark as Read" notification action with no UI: dismisses the notification, calls
 * the account's mark-as-read endpoint with its stored token, then tells JS (if it is alive) so it
 * can refresh caches.
 */
class MarkAsReadReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    if (intent.action != NotificationBuilder.ACTION_MARK_AS_READ) return
    val accountID = intent.getStringExtra(NotificationBuilder.EXTRA_ACCOUNT_ID) ?: return
    val contentID = intent.getStringExtra(NotificationBuilder.EXTRA_CONTENT_ID) ?: return
    val path = intent.getStringExtra(NotificationBuilder.EXTRA_MARK_AS_READ_URL) ?: return

    NotificationBuilder.cancelContent(context, accountID, contentID)

    val pending = goAsync()
    val appContext = context.applicationContext
    CoroutineScope(Dispatchers.IO).launch {
      try {
        val account = PushAccountStore(appContext).load().firstOrNull { it.accountID == accountID }
        if (account == null) {
          Log.w(TAG, "No stored account $accountID to mark as read")
          return@launch
        }
        val request = Request.Builder()
          .url(account.apiUrl(path))
          .header("Authorization", "Bearer ${account.token}")
          .get()
          .build()
        PushHttp.apiClient.newCall(request).execute().use { response ->
          if (response.isSuccessful) {
            PushEvents.listener?.onMarkAsRead(accountID, contentID)
          } else {
            Log.w(TAG, "Mark as read for $contentID failed with HTTP ${response.code}")
          }
        }
      } catch (e: Exception) {
        Log.w(TAG, "Mark as read for $contentID failed", e)
      } finally {
        pending.finish()
      }
    }
  }

  companion object {
    private const val TAG = "MarkAsReadReceiver"
  }
}
