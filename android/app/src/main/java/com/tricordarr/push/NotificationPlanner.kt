package com.tricordarr.push

import org.json.JSONObject

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
) {
  val tag: String get() = NotificationPlanner.tagFor(accountID)
  val id: Int get() = NotificationPlanner.idFor(contentID)
}

sealed class PlanResult {
  data class Post(val plan: NotificationPlan) : PlanResult()

  data class Skip(val reason: String) : PlanResult()
}

/**
 * Port of `generatePushNotificationFromEvent` / `generateContentNotification`: decides whether a
 * socket event becomes a notification and what it looks like, using the shared event table and
 * the account's synced preferences.
 */
object NotificationPlanner {
  const val APP_LINK_PREFIX = "tricordarr://"

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

  fun plan(events: NotificationEvents, account: PushAccount, raw: String, nowMillis: Long): PlanResult {
    val data = try {
      JSONObject(raw)
    } catch (e: Exception) {
      return PlanResult.Skip("unparseable event")
    }
    val type = typeOf(data) ?: return PlanResult.Skip("event has no type")

    if (account.prefs.pushNotifications[type] != true) {
      return PlanResult.Skip("category $type disabled")
    }
    val mutedUntil = account.prefs.muteNotificationsUntil
    if (mutedUntil != null && nowMillis < mutedUntil) {
      return PlanResult.Skip("notifications muted")
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
      ),
    )
  }

  /** Adds `?account=<id>` for the tap-to-switch work to come. JS ignores it today. */
  fun withAccount(link: String, accountID: String): String {
    val separator = if (link.contains('?')) '&' else '?'
    return "$link${separator}account=${java.net.URLEncoder.encode(accountID, "UTF-8")}"
  }

  private val IMAGE = Regex("!\\[([^\\]]*)]\\([^)]*\\)")
  private val LINK = Regex("\\[([^\\]]*)]\\([^)]*\\)")
  private val HEADER = Regex("(?m)^\\s{0,3}#{1,6}\\s*")
  private val QUOTE = Regex("(?m)^\\s{0,3}>\\s?")
  private val EMPHASIS = Regex("[*_~`]+")

  /** A small port of the `remove-markdown` package the JS side used for notification bodies. */
  fun stripMarkdown(text: String): String =
    text
      .replace(IMAGE, "$1")
      .replace(LINK, "$1")
      .replace(HEADER, "")
      .replace(QUOTE, "")
      .replace(EMPHASIS, "")
      .trim()
}
