package com.tricordarr.push

import android.app.Notification
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.app.Person
import androidx.core.content.LocusIdCompat
import androidx.core.content.pm.ShortcutInfoCompat
import androidx.core.content.pm.ShortcutManagerCompat
import androidx.core.graphics.drawable.IconCompat
import com.tricordarr.R
import java.text.DateFormat
import java.util.Date

/**
 * Android half of the notification port: turns a [NotificationPlan] into a posted notification,
 * and builds the service, "connection lost" and "tap to reconnect" notifications.
 */
object NotificationBuilder {
  private const val TAG = "NotificationBuilder"
  private const val SERVICE_NOTIFICATION_TAG = "push-service"
  const val SERVICE_NOTIFICATION_ID = 0x7472
  private const val CONNECTION_LOST_ID = 0x7473
  private const val RECONNECT_ID = 0x7474
  private const val SERVICE_CHANNEL = "service"
  private const val CONNECTION_CHANNEL = "connection"
  private const val CALL_CHANNEL = "krakentalkcalls"
  const val CALL_NOTIFICATION_ID = 0x7475
  /**
   * The service, call and connection notifications share an explicit group. Android bundles an app's
   * ungrouped notifications on its own, and that bundle would pull chat notifications out of the
   * Conversations section along with these.
   */
  private const val STATUS_GROUP = "status"
  internal const val BRAND_COLOR = 0xFF063953.toInt()

  const val ACTION_MARK_AS_READ = "com.tricordarr.push.MARK_AS_READ"
  const val EXTRA_ACCOUNT_ID = "accountID"
  const val EXTRA_CONTENT_ID = "contentID"
  const val EXTRA_MARK_AS_READ_URL = "markAsReadUrl"

  private const val BACKGROUND_CONNECTION_LINK = NotificationPlanner.APP_LINK_PREFIX + "settings/backgroundconnection"
  private const val HOME_LINK = NotificationPlanner.APP_LINK_PREFIX + "home"

  private val immutableUpdate = PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT

  private fun viewIntent(context: Context, link: String?): Intent =
    if (link != null) {
      Intent(Intent.ACTION_VIEW, Uri.parse(link)).setPackage(context.packageName)
    } else {
      context.packageManager.getLaunchIntentForPackage(context.packageName) ?: Intent()
    }.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)

  private fun activityPendingIntent(context: Context, requestCode: Int, link: String?): PendingIntent =
    PendingIntent.getActivity(context, requestCode, viewIntent(context, link), immutableUpdate)

  private fun notify(context: Context, tag: String?, id: Int, notification: Notification) {
    try {
      NotificationManagerCompat.from(context).notify(tag, id, notification)
    } catch (e: SecurityException) {
      // POST_NOTIFICATIONS revoked. JS also refuses to start the service without it.
      Log.w(TAG, "Not allowed to post notifications", e)
    }
  }

  /**
   * Posts a content notification for [plan]. [username] is only shown when several accounts are active.
   * A messaging plan appends to the MessagingStyle of the notification already showing. Its sender is
   * the event's author with their avatar (see [NotificationAvatar]), posted as a conversation
   * notification, or the app icon when the server sent no author. Loading an avatar can block
   * briefly, so never call this on the main thread.
   */
  fun post(context: Context, plan: NotificationPlan, username: String? = null) {
    val builder = NotificationCompat.Builder(context, plan.channelID)
      .setSmallIcon(R.drawable.ic_notification)
      .setContentTitle(plan.title)
      .setContentText(plan.body)
      .setStyle(NotificationCompat.BigTextStyle().bigText(plan.body))
      .setAutoCancel(plan.autoCancel)
      .setOngoing(plan.ongoing)
      .setContentIntent(activityPendingIntent(context, plan.id, plan.deepLink))
      .addExtras(
        android.os.Bundle().apply {
          putString(EXTRA_CONTENT_ID, plan.contentID)
          putString("secondaryContentID", plan.secondaryContentID)
        },
      )
    val accountName = username?.takeIf { it.isNotEmpty() }
    accountName?.let { builder.setSubText(it) }

    if (plan.messaging) {
      val author = plan.author
      val sender = if (author != null) {
        val person = Person.Builder()
          .setKey(author.userID)
          .setName(author.name())
          .setIcon(NotificationAvatar.icon(context, plan))
          .build()
        // Linking a long-lived shortcut makes this a conversation notification (Android 11+), as
        // Signal and Messages post: the avatar is the only icon, in the Conversations section.
        val shortcutId = publishConversationShortcut(context, plan, person)
        builder
          .setShortcutId(shortcutId)
          .setLocusId(LocusIdCompat(shortcutId))
          .setCategory(NotificationCompat.CATEGORY_MESSAGE)
          // The header reads "Tricordarr • New Seamail • 3m"; the sender is the bold title.
          .setSubText(listOfNotNull(plan.title, accountName).joinToString(" · "))
        person
      } else {
        // An older server sends no author. Without an icon Android draws a letter avatar from the
        // name ("N" for "New Seamail"), so use the round launcher icon, a bundled resource.
        Person.Builder()
          .setName(plan.title)
          .setIcon(IconCompat.createWithResource(context, R.mipmap.ic_launcher_round))
          .build()
      }
      val style = findActive(context, plan.tag, plan.id)
        ?.let { NotificationCompat.MessagingStyle.extractMessagingStyleFromNotification(it) }
        ?: NotificationCompat.MessagingStyle(Person.Builder().setName("You").build())
      style.addMessage(plan.body, System.currentTimeMillis(), sender)
      builder.setStyle(style)
    }

    if (plan.markAsReadUrl != null) {
      val markRead = Intent(context, MarkAsReadReceiver::class.java)
        .setAction(ACTION_MARK_AS_READ)
        .setData(Uri.parse("tricordarr-markread://${Uri.encode(plan.accountID)}/${Uri.encode(plan.contentID)}"))
        .putExtra(EXTRA_ACCOUNT_ID, plan.accountID)
        .putExtra(EXTRA_CONTENT_ID, plan.contentID)
        .putExtra(EXTRA_MARK_AS_READ_URL, plan.markAsReadUrl)
      builder.addAction(
        0,
        "Mark as Read",
        PendingIntent.getBroadcast(context, plan.id, markRead, immutableUpdate),
      )
    }

    notify(context, plan.tag, plan.id, builder.build())
  }

  /**
   * Publishes the long-lived shortcut a conversation notification needs, one per chat of one account,
   * labelled and pictured as [sender]. A tap opens the chat. Android keeps a bounded number of dynamic
   * shortcuts, dropping the oldest, and lists recent ones on the launcher icon's long-press menu.
   * Returns the shortcut ID.
   */
  private fun publishConversationShortcut(context: Context, plan: NotificationPlan, sender: Person): String {
    val shortcutId = "chat:${plan.accountID}:${plan.contentID}"
    val shortcut = ShortcutInfoCompat.Builder(context, shortcutId)
      .setLongLived(true)
      .setShortLabel(sender.name ?: plan.title)
      .setPerson(sender)
      .setIcon(sender.icon)
      .setLocusId(LocusIdCompat(shortcutId))
      .setIntent(viewIntent(context, plan.deepLink))
      .build()
    try {
      ShortcutManagerCompat.pushDynamicShortcut(context, shortcut)
    } catch (e: Exception) {
      // Without the shortcut the notification still posts, in the plain messaging layout.
      Log.w(TAG, "Could not publish conversation shortcut", e)
    }
    return shortcutId
  }

  private fun findActive(context: Context, tag: String?, id: Int): Notification? {
    val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    return manager.activeNotifications.firstOrNull { it.id == id && it.tag == tag }?.notification
  }

  /** Dismisses the notification for one piece of content, if it is showing. */
  fun cancelContent(context: Context, accountID: String, contentID: String) {
    NotificationManagerCompat.from(context).cancel(NotificationPlanner.tagFor(accountID), NotificationPlanner.idFor(contentID))
  }

  /** Dismisses every notification of [accountID] that belongs to a parent object, e.g. a forum. */
  fun cancelSecondary(context: Context, accountID: String, secondaryContentID: String) {
    val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    val tag = NotificationPlanner.tagFor(accountID)
    manager.activeNotifications
      .filter { it.tag == tag && it.notification.extras.getString("secondaryContentID") == secondaryContentID }
      .forEach { manager.cancel(it.tag, it.id) }
  }

  /**
   * The persistent foreground service notification. [subText] sits in the small header line,
   * [text] is the collapsed content, and [expanded], when present, replaces it when the
   * notification is expanded.
   */
  fun serviceNotification(context: Context, subText: String?, text: String, expanded: String? = null): Notification =
    NotificationCompat.Builder(context, SERVICE_CHANNEL)
      .setGroup(STATUS_GROUP)
      .setSmallIcon(R.drawable.ic_notification)
      .setSubText(subText)
      .setContentText(text)
      // The default "when" is the post time, shown as a relative "Now" that never updates.
      .setShowWhen(false)
      .apply { expanded?.let { setStyle(NotificationCompat.BigTextStyle().bigText(it)) } }
      .setColor(BRAND_COLOR)
      .setColorized(true)
      // Not ongoing, so on Android 14+ the user can dismiss it and the service keeps running.
      .setOngoing(false)
      .setOnlyAlertOnce(true)
      .setForegroundServiceBehavior(NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE)
      .setContentIntent(activityPendingIntent(context, SERVICE_NOTIFICATION_ID, HOME_LINK))
      .build()

  /**
   * The ongoing notification for an active call. The chronometer is counted by the system from
   * [startedAtMs], so nothing has to update it every second.
   */
  fun callNotification(context: Context, remoteUsername: String, startedAtMs: Long, muted: Boolean): Notification =
    NotificationCompat.Builder(context, CALL_CHANNEL)
      .setGroup(STATUS_GROUP)
      .setSmallIcon(R.drawable.ic_notification)
      .setContentTitle("Call with $remoteUsername")
      .setContentText(if (muted) "Muted" else "In call")
      .setColor(BRAND_COLOR)
      .setColorized(true)
      .setOngoing(true)
      // The calls channel carries the incoming-call ring, which an in-call update must not repeat.
      .setSilent(true)
      .setCategory(NotificationCompat.CATEGORY_CALL)
      .setUsesChronometer(true)
      .setWhen(startedAtMs)
      .setForegroundServiceBehavior(NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE)
      .setContentIntent(activityPendingIntent(context, CALL_NOTIFICATION_ID, HOME_LINK))
      .build()

  /** Refreshes the already-showing call notification, e.g. when the mute state changes. */
  fun updateCallNotification(context: Context, remoteUsername: String, startedAtMs: Long, muted: Boolean) {
    notify(context, null, CALL_NOTIFICATION_ID, callNotification(context, remoteUsername, startedAtMs, muted))
  }

  fun cancelCallNotification(context: Context) {
    NotificationManagerCompat.from(context).cancel(null, CALL_NOTIFICATION_ID)
  }

  /**
   * Refreshes the text of the already-showing service notification. Posting by the same ID would
   * bring it back after the user swiped it away (Android 14+ allows that while the service keeps
   * running), so a dismissed notification is left dismissed until the service next enters the foreground.
   * Returns whether the notification was updated.
   */
  fun updateServiceNotification(context: Context, subText: String?, text: String, expanded: String?): Boolean {
    if (findActive(context, null, SERVICE_NOTIFICATION_ID) == null) {
      return false
    }
    notify(context, null, SERVICE_NOTIFICATION_ID, serviceNotification(context, subText, text, expanded))
    return true
  }

  /** Each account gets its own "connection lost" notification, so one recovering leaves the others showing. */
  private fun connectionLostTag(accountID: String): String = "$SERVICE_NOTIFICATION_TAG:$accountID"

  /** Posted when an account gives up after repeated failures. It stays stopped until the app is opened. */
  fun postConnectionLost(context: Context, accountID: String, label: String?) {
    val time = DateFormat.getTimeInstance().format(Date())
    val who = label?.takeIf { it.isNotEmpty() }?.let { " for $it" } ?: ""
    val notification = NotificationCompat.Builder(context, CONNECTION_CHANNEL)
      .setGroup(STATUS_GROUP)
      .setSmallIcon(R.drawable.ic_notification)
      .setContentTitle("Twitarr Connection Lost")
      .setContentText("Connection$who lost at $time. Open Tricordarr to reconnect.")
      .setColor(0xFF8B1A1A.toInt())
      .setColorized(true)
      // The text already carries the time of loss; a relative "Now" would go stale.
      .setShowWhen(false)
      .setAutoCancel(true)
      .setContentIntent(activityPendingIntent(context, CONNECTION_LOST_ID, BACKGROUND_CONNECTION_LINK))
      .build()
    notify(context, connectionLostTag(accountID), CONNECTION_LOST_ID, notification)
  }

  fun cancelConnectionLost(context: Context, accountID: String) {
    NotificationManagerCompat.from(context).cancel(connectionLostTag(accountID), CONNECTION_LOST_ID)
  }

  /** Dismisses the "connection lost" notification of every account, for when the service stops. */
  fun cancelAllConnectionLost(context: Context) {
    val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    manager.activeNotifications
      .filter { it.id == CONNECTION_LOST_ID && it.tag?.startsWith("$SERVICE_NOTIFICATION_TAG:") == true }
      .forEach { manager.cancel(it.tag, it.id) }
  }

  /**
   * Background foreground-service starts are blocked on API 31+ outside a few exemptions, so when
   * one is refused we ask the user to open the app, which restarts the service from the foreground.
   */
  fun postReconnectNeeded(context: Context) {
    val notification = NotificationCompat.Builder(context, CONNECTION_CHANNEL)
      .setGroup(STATUS_GROUP)
      .setSmallIcon(R.drawable.ic_notification)
      .setContentTitle("Twitarr Notifications Paused")
      .setContentText("Tap to reconnect to the Twitarr server.")
      .setColor(Color.rgb(6, 57, 83))
      .setShowWhen(false)
      .setAutoCancel(true)
      .setContentIntent(activityPendingIntent(context, RECONNECT_ID, null))
      .build()
    notify(context, SERVICE_NOTIFICATION_TAG, RECONNECT_ID, notification)
  }

  fun cancelReconnectNeeded(context: Context) {
    NotificationManagerCompat.from(context).cancel(SERVICE_NOTIFICATION_TAG, RECONNECT_ID)
  }
}
