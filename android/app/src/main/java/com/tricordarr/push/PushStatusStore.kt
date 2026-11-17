package com.tricordarr.push

import android.content.Context
import org.json.JSONObject

/**
 * Persists each account's [AccountStatus] so JS can pull it whether or not the service process
 * is alive. Contains no secrets, so plain SharedPreferences is fine.
 */
class PushStatusStore(context: Context) {
  private val prefs = context.getSharedPreferences("tricordarr_push_status", Context.MODE_PRIVATE)

  @Synchronized
  fun get(accountID: String): AccountStatus? =
    prefs.getString(accountID, null)?.let { runCatching { AccountStatus.fromJson(JSONObject(it)) }.getOrNull() }

  @Synchronized
  fun put(status: AccountStatus) {
    prefs.edit().putString(status.accountID, status.toJson().toString()).apply()
  }

  @Synchronized
  fun all(): List<AccountStatus> =
    prefs.all.values.mapNotNull { value ->
      (value as? String)?.let { runCatching { AccountStatus.fromJson(JSONObject(it)) }.getOrNull() }
    }

  /** Drops statuses for accounts that are no longer synced. */
  @Synchronized
  fun retainOnly(accountIDs: Set<String>) {
    val editor = prefs.edit()
    prefs.all.keys.filter { it !in accountIDs }.forEach { editor.remove(it) }
    editor.apply()
  }
}
