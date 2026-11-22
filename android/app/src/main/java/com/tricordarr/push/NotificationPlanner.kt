package com.tricordarr.push

import org.json.JSONObject

/** The user who wrote the content behind a notification, from the socket event's `author` UserHeader. */
data class NotificationAuthor(
  val userID: String,
  val username: String,
  val displayName: String?,
  val userImage: String?,
) {
  /** The name shown for the sender: the display name, or the username when there is none. */
  fun name(): String = displayName ?: username
}

/** Everything needed to post one notification, with no Android types so it can be unit tested. */
data class NotificationPlan(
  val accountID: String,
  val type: String,
  val contentID: String,
  val secondaryContentID: String?,
  val channelID: String,
  val title: String,
  val body: String,
  /** Full `tricordarr://` deep link for a tap, or null to just open the app. */
  val deepLink: String?,
  val markAsReadUrl: String?,
  val autoCancel: Boolean,
  val ongoing: Boolean,
  val messaging: Boolean,
  /** Who wrote the content, when the server sent one. Null from servers that predate the field. */
  val author: NotificationAuthor? = null,
  /**
   * The author's photo as the thumbnail URL the app's AvatarImage loads, so it is the same image
   * cache key. Null when there is no author or the author has no photo.
   */
  val avatarThumbUrl: String? = null,
) {
  val tag: String get() = NotificationPlanner.tagFor(accountID)
  val id: Int get() = NotificationPlanner.idFor(contentID)
}

sealed class PlanResult {
  data class Post(val plan: NotificationPlan) : PlanResult()

  data class Skip(val reason: String) : PlanResult()

  /** Remove the account's notification for [contentID], if one is showing. */
  data class Dismiss(val accountID: String, val contentID: String) : PlanResult()
}

/**
 * Port of `generatePushNotificationFromEvent` / `generateContentNotification`: decides whether a
 * socket event becomes a notification and what it looks like, using the shared event table and
 * the account's synced preferences.
 */
object NotificationPlanner {
  const val APP_LINK_PREFIX = "tricordarr://"
  private const val PHONE_CALL_ANSWERED = "phoneCallAnswered"

  /** Notifications are tagged per account so one account's content IDs cannot collide with another's. */
  fun tagFor(accountID: String): String = "acct:$accountID"

  /** Like JS, the notification ID is derived from the content ID, so a newer event replaces an older one. */
  fun idFor(contentID: String): Int = contentID.hashCode()

  /** The event type is the single key of the `type` object (`{"seamailUnreadMsg": {}}`), or a plain string. */
  fun typeOf(data: JSONObject): String? {
    val type = data.opt("type")
    return when (type) {
      is JSONObject -> type.keys().asSequence().firstOrNull()
      is String -> type.ifEmpty { null }
      else -> null
    }
  }

  /**
   * Stops a call ringing on this device. The incoming call notification is keyed by the call ID,
   * which is the content ID of every event about that call.
   */
  private fun dismissCall(account: PushAccount, data: JSONObject): PlanResult {
    val callID = data.opt("contentID")?.toString().orEmpty()
    if (callID.isEmpty()) {
      return PlanResult.Skip("call event has no ID")
    }
    return PlanResult.Dismiss(account.accountID, callID)
  }

  /** Decides what one socket event does for [account]: post a notification, dismiss one, or nothing. */
  fun plan(events: NotificationEvents, account: PushAccount, raw: String, nowMillis: Long): PlanResult {
    val data = try {
      JSONObject(raw)
    } catch (e: Exception) {
      return PlanResult.Skip("unparseable event")
    }
    val type = typeOf(data) ?: return PlanResult.Skip("event has no type")
    val isSignal = type in events.signals

    // Call signalling keeps the call notifications in step, so the category toggles never block it.
    // Only an explicit false disables a category: a type the synced preferences do not know yet
    // (added by an app update) is on, as it is in the JS defaults and on iOS.
    if (!isSignal && account.prefs.pushNotifications[type] == false) {
      return PlanResult.Skip("category $type disabled")
    }
    if (type == PHONE_CALL_ANSWERED) {
      // Answered on this device or another, the call no longer needs to ring here.
      return dismissCall(account, data)
    }
    val mutedUntil = account.prefs.muteNotificationsUntil
    if (mutedUntil != null && nowMillis < mutedUntil) {
      // Mute stops anything new being posted, but a call that rang before the mute began must still
      // stop ringing, so call signalling clears it instead of posting over it.
      return if (isSignal) dismissCall(account, data) else PlanResult.Skip("notifications muted")
    }
    val spec = events.events[type] ?: return PlanResult.Skip("no notification for type $type")

    val contentID = data.opt("contentID")?.toString().orEmpty()
    val caller = data.optJSONObject("caller")
    val callerUserID = caller?.opt("userID")?.toString()
    val callerUsername = caller?.optString("username")

    var path = spec.url
    if (path != null && path.contains("{caller")) {
      // Without a caller the call URL is meaningless, so a tap just opens the app (as in JS).
      path = if (callerUserID != null && callerUsername != null) {
        path.replace("{callerUserID}", callerUserID).replace("{callerUsername}", callerUsername)
      } else {
        null
      }
    }
    path = path?.replace("{contentID}", contentID)

    val author = parseAuthor(data.optJSONObject("author"))

    return PlanResult.Post(
      NotificationPlan(
        accountID = account.accountID,
        type = type,
        contentID = contentID,
        secondaryContentID = data.optString("secondaryContentID").ifEmpty { null },
        channelID = spec.channel,
        title = spec.title,
        body = stripMarkdown(data.optString("info", "")),
        deepLink = path?.let { withAccount(APP_LINK_PREFIX + it.trimStart('/'), account.accountID) },
        markAsReadUrl = spec.markAsReadUrl?.replace("{contentID}", contentID),
        autoCancel = spec.autoCancel,
        ongoing = spec.ongoing,
        messaging = spec.messaging,
        author = author,
        avatarThumbUrl = author?.userImage?.let { account.apiUrl("/image/thumb/$it") },
      ),
    )
  }

  /** Reads an `author` UserHeader. Null when it is absent or lacks a userID or username. */
  private fun parseAuthor(json: JSONObject?): NotificationAuthor? {
    if (json == null) {
      return null
    }
    val userID = optText(json, "userID") ?: return null
    val username = optText(json, "username") ?: return null
    return NotificationAuthor(
      userID = userID,
      username = username,
      displayName = optText(json, "displayName"),
      userImage = optText(json, "userImage"),
    )
  }

  /** A non-empty string field. Unlike `optString`, a JSON null is null here, not the text "null". */
  private fun optText(json: JSONObject, key: String): String? =
    if (json.isNull(key)) null else json.opt(key)?.toString()?.ifEmpty { null }

  /**
   * Shared accounts that read better as an abbreviation than as their first letter. Keep in step
   * with `NotificationAvatar.swift` on iOS.
   */
  private val ALIAS_INITIALS = mapOf(
    "moderator" to "M",
    "twitarrteam" to "TT",
    "communitysupport" to "CS",
    "tho" to "THO",
  )

  /** The letters drawn on a letter avatar for a user with no photo. */
  fun avatarInitials(username: String): String {
    ALIAS_INITIALS[username.lowercase()]?.let { return it }
    if (username.isEmpty()) {
      return "?"
    }
    val first = String(Character.toChars(username.codePointAt(0)))
    return first.uppercase()
  }

  /** Adds `?account=<id>` so JS opens the link in the account the notification was for, switching if needed. */
  fun withAccount(link: String, accountID: String): String {
    val separator = if (link.contains('?')) '&' else '?'
    return "$link${separator}account=${java.net.URLEncoder.encode(accountID, "UTF-8")}"
  }

  private val IMAGE = Regex("!\\[([^\\]]*)]\\([^)]*\\)")
  private val LINK = Regex("\\[([^\\]]*)]\\([^)]*\\)")
  private val HEADER = Regex("(?m)^\\s{0,3}#{1,6}\\s*")
  private val QUOTE = Regex("(?m)^\\s{0,3}>\\s?")
  private val EMPHASIS = Regex("[*_~`]+")

  /** Strips Markdown syntax from a notification body, keeping the text of links and images. */
  fun stripMarkdown(text: String): String =
    text
      .replace(IMAGE, "$1")
      .replace(LINK, "$1")
      .replace(HEADER, "")
      .replace(QUOTE, "")
      .replace(EMPHASIS, "")
      .trim()
}
