package com.tricordarr.push

import org.json.JSONArray
import org.json.JSONObject

/**
 * Per-account notification preferences, copied from the JS AppConfig by `syncPushAccounts`.
 * [pushNotifications] maps a NotificationTypeData key to whether the user wants it. A type that
 * is missing from the map is treated as enabled, matching the JS defaults and iOS.
 */
data class PushPrefs(
  val pushNotifications: Map<String, Boolean>,
  val muteNotificationsUntil: Long?,
)

/**
 * An account the push service keeps a notification socket open for. [accountID] is an opaque key
 * supplied by JS; it is never parsed or generated natively.
 */
data class PushAccount(
  val accountID: String,
  val userID: String,
  val username: String,
  val serverUrl: String,
  val urlPrefix: String,
  val token: String,
  val enabled: Boolean,
  val prefs: PushPrefs,
  /** Epoch ms after which the worker must not restart on its own (boot, app update). Null: no limit. */
  val autoStartUntil: Long? = null,
) {
  /** Whether a restart that nobody asked for (boot, app update) may bring this account's worker back. */
  fun mayAutoStart(now: Long): Boolean = autoStartUntil == null || now <= autoStartUntil

  /** The username, or the userID until the username is known. */
  fun name(): String = username.ifEmpty { userID }

  /** The server URL without its scheme, matching the JS serverUrlHost. */
  fun host(): String = serverUrl.replace(Regex("^https?://"), "")

  /** `username@server` label, matching the JS accountLabel. */
  fun label(): String = "${name()}@${host()}"

  /** The wss:// (or ws://) URL of the Swiftarr notification socket. */
  fun socketUrl(): String = toWebSocketUrl(serverUrl + urlPrefix + "/notification/socket")

  /** The http(s) URL of a Swiftarr API path such as `/fez/123`. */
  fun apiUrl(path: String): String = serverUrl + urlPrefix + path

  /** True when a change to [other] requires tearing down and reopening the socket. */
  fun connectionDiffers(other: PushAccount): Boolean =
    serverUrl != other.serverUrl || urlPrefix != other.urlPrefix || token != other.token

  fun toJson(): JSONObject =
    JSONObject().apply {
      put("accountID", accountID)
      put("userID", userID)
      put("username", username)
      put("serverUrl", serverUrl)
      put("urlPrefix", urlPrefix)
      put("token", token)
      put("enabled", enabled)
      if (autoStartUntil != null) {
        put("autoStartUntil", autoStartUntil)
      }
      put(
        "prefs",
        JSONObject().apply {
          put("pushNotifications", JSONObject(prefs.pushNotifications))
          if (prefs.muteNotificationsUntil != null) {
            put("muteNotificationsUntil", prefs.muteNotificationsUntil)
          }
        },
      )
    }

  companion object {
    /** http -> ws and https -> wss. */
    fun toWebSocketUrl(url: String): String =
      when {
        url.startsWith("https://") -> "wss://" + url.removePrefix("https://")
        url.startsWith("http://") -> "ws://" + url.removePrefix("http://")
        else -> url
      }

    fun fromJson(json: JSONObject): PushAccount {
      val prefsJson = json.optJSONObject("prefs")
      val typesJson = prefsJson?.optJSONObject("pushNotifications")
      val types = mutableMapOf<String, Boolean>()
      typesJson?.keys()?.forEach { key -> types[key] = typesJson.optBoolean(key, false) }
      val mute = if (prefsJson != null && prefsJson.has("muteNotificationsUntil") && !prefsJson.isNull("muteNotificationsUntil")) {
        prefsJson.getLong("muteNotificationsUntil")
      } else {
        null
      }
      return PushAccount(
        accountID = json.getString("accountID"),
        userID = json.optString("userID", ""),
        username = json.optString("username", ""),
        serverUrl = json.getString("serverUrl").trimEnd('/'),
        urlPrefix = json.optString("urlPrefix", ""),
        token = json.getString("token"),
        enabled = json.optBoolean("enabled", true),
        prefs = PushPrefs(types, mute),
        autoStartUntil = if (json.has("autoStartUntil") && !json.isNull("autoStartUntil")) json.getLong("autoStartUntil") else null,
      )
    }

    fun listFromJson(text: String): List<PushAccount> {
      val array = JSONArray(text)
      return (0 until array.length()).map { fromJson(array.getJSONObject(it)) }
    }

    fun listToJson(accounts: List<PushAccount>): String =
      JSONArray().apply { accounts.forEach { put(it.toJson()) } }.toString()
  }
}
