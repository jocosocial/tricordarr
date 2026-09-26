package com.tricordarr.call

import android.content.Context
import android.util.Log

/**
 * Stores the Swiftarr base URL and auth token so that call notification actions can reach the
 * server while the JS runtime is not running.
 *
 * Declining a KrakenTalk call from the notification shade or the lock screen has to work when the
 * app has been swiped away, which rules out doing the POST from JS: React Native would have to
 * spin up a headless JS context first, which is slow and unreliable in exactly the situation the
 * user cares about. Native needs its own copy of the credentials instead.
 *
 * These are written by NativeTricordarrModule.setCallCredentials() whenever the session changes.
 */
object CallCredentials {
  private const val TAG = "CallCredentials"
  private const val PREFS_NAME = "com.tricordarr.call.credentials"
  private const val KEY_SERVER_URL = "serverUrl"
  private const val KEY_TOKEN = "token"

  private fun prefs(context: Context) =
      context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

  /** Persist the server base URL and bearer token used for call management requests. */
  fun set(context: Context, serverUrl: String, token: String) {
    prefs(context).edit().putString(KEY_SERVER_URL, serverUrl).putString(KEY_TOKEN, token).apply()
    Log.d(TAG, "Stored call credentials for $serverUrl")
  }

  /** Forget any stored credentials. Called on logout or session change. */
  fun clear(context: Context) {
    prefs(context).edit().remove(KEY_SERVER_URL).remove(KEY_TOKEN).apply()
    Log.d(TAG, "Cleared call credentials")
  }

  /** The stored base URL, or null if no session has been established yet. */
  fun serverUrl(context: Context): String? = prefs(context).getString(KEY_SERVER_URL, null)

  /** The stored bearer token, or null if no session has been established yet. */
  fun token(context: Context): String? = prefs(context).getString(KEY_TOKEN, null)
}
