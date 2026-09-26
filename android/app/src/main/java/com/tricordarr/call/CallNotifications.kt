package com.tricordarr.call

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.Person
import androidx.core.content.ContextCompat
import com.tricordarr.MainActivity
import com.tricordarr.R

/**
 * Builds the incoming and ongoing call notifications for KrakenTalk.
 *
 * Uses NotificationCompat.CallStyle, which maps to the platform Notification.CallStyle on API 31+
 * and degrades to an equivalent decorated layout below that. CallStyle is what gets a call the
 * correct ranking and lock-screen presentation from the system, and it is not reachable through
 * the app's JS notification library, which is the main reason call notifications are built here
 * in native code rather than alongside the rest of the app's notifications.
 *
 * Both states share one notification id so that answering transitions the existing notification in
 * place: CallService passes the same id to startForeground(), which adopts it as the foreground
 * service notification rather than posting a second entry.
 */
object CallNotifications {
  /** High-importance channel for a ringing call. Full-screen intents are ignored below HIGH. */
  const val CHANNEL_INCOMING = "krakentalk_incoming_v2"

  /** Low-importance, silent channel for the in-call notification. */
  const val CHANNEL_ONGOING = "krakentalk_ongoing_v2"

  /** Single id shared by the ringing and in-call notifications. Only one call runs at a time. */
  const val NOTIFICATION_ID = 9001

  // Distinct request codes keep these PendingIntents from aliasing each other. Answer and open
  // target the same activity and differ only in the URI, which filterEquals() does compare, but
  // being explicit here is cheaper than relying on that.
  private const val REQUEST_ANSWER = 1
  private const val REQUEST_OPEN_INCOMING = 2
  private const val REQUEST_OPEN_ONGOING = 3

  // Channels created by the old JS implementation. Channel settings are immutable once created on
  // a device, so the replacements above use new ids and these are deleted on startup.
  private val LEGACY_CHANNEL_IDS = listOf("krakentalkcalls", "krakentalkmgmt")

  // Temporal-3 cadence, carried over from the previous implementation.
  private val VIBRATION_PATTERN =
      longArrayOf(0, 500, 500, 500, 500, 500, 1500, 500, 500, 500, 500, 500, 1500)

  private fun manager(context: Context) =
      context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

  /**
   * Create the call notification channels and remove the ones the JS implementation used.
   * Safe to call repeatedly; creating an existing channel is a no-op for its settings.
   */
  fun ensureChannels(context: Context) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return
    }
    val manager = manager(context)

    LEGACY_CHANNEL_IDS.forEach { manager.deleteNotificationChannel(it) }

    val incoming =
        NotificationChannel(
            CHANNEL_INCOMING, "KrakenTalk Calls", NotificationManager.IMPORTANCE_HIGH)
    incoming.description = "Incoming KrakenTalk calls through Twitarr."
    incoming.enableVibration(true)
    incoming.vibrationPattern = VIBRATION_PATTERN
    incoming.setShowBadge(false)
    manager.createNotificationChannel(incoming)

    val ongoing =
        NotificationChannel(
            CHANNEL_ONGOING, "KrakenTalk In Call", NotificationManager.IMPORTANCE_LOW)
    ongoing.description = "Status of a KrakenTalk call in progress."
    ongoing.enableVibration(false)
    ongoing.setSound(null, null)
    ongoing.setShowBadge(false)
    manager.createNotificationChannel(ongoing)
  }

  private fun person(callerName: String): Person =
      Person.Builder().setName(callerName).setImportant(true).build()

  private fun immutableFlags() =
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE

  /**
   * A PendingIntent that opens the app at the given in-app route. Reuses the existing
   * `tricordarr://` deep-link scheme so no new navigation plumbing is needed.
   */
  private fun deepLinkIntent(context: Context, route: String, requestCode: Int): PendingIntent {
    val intent =
        Intent(context, MainActivity::class.java).apply {
          action = Intent.ACTION_VIEW
          data = Uri.parse("tricordarr://$route")
          flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
    return PendingIntent.getActivity(context, requestCode, intent, immutableFlags())
  }

  /**
   * A PendingIntent that just brings the app to the front, with no deep link.
   *
   * There is no route definition for the active call screen, so there is nothing to link to. The
   * in-app CallOverlay already provides the way back into a call in progress.
   */
  private fun launchAppIntent(context: Context, requestCode: Int): PendingIntent {
    val intent =
        Intent(context, MainActivity::class.java).apply {
          action = Intent.ACTION_MAIN
          addCategory(Intent.CATEGORY_LAUNCHER)
          flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
    return PendingIntent.getActivity(context, requestCode, intent, immutableFlags())
  }

  /** A PendingIntent that delivers a call action to [CallActionReceiver] without opening the UI. */
  private fun actionIntent(context: Context, action: String, callID: String): PendingIntent {
    val intent =
        Intent(context, CallActionReceiver::class.java).apply {
          this.action = action
          putExtra(CallActionReceiver.EXTRA_CALL_ID, callID)
        }
    return PendingIntent.getBroadcast(context, action.hashCode(), intent, immutableFlags())
  }

  private fun baseBuilder(context: Context, channelId: String): NotificationCompat.Builder =
      NotificationCompat.Builder(context, channelId)
          .setSmallIcon(R.drawable.ic_notification)
          .setColor(ContextCompat.getColor(context, R.color.krakentalk_notification))
          .setColorized(true)
          .setCategory(NotificationCompat.CATEGORY_CALL)
          .setOngoing(true)
          .setOnlyAlertOnce(true)

  /**
   * The ringing notification. Posted without a foreground service: no microphone is in use yet,
   * and starting a microphone-typed foreground service from the background is restricted.
   */
  fun buildIncoming(
      context: Context,
      callID: String,
      callerName: String,
      callerUserID: String
  ): Notification {
    // Usernames are user-supplied, so they have to be escaped before going into a URI path.
    val encodedName = Uri.encode(callerName)
    val route = "phonecall/$callID/from/$callerUserID/$encodedName"

    // The Answer button answers the call. It cannot do that natively -- answering means opening a
    // websocket and POSTing, which lives in JS -- so it deep-links with autoAnswer set and the
    // receive screen answers on arrival. Without the flag this button merely opened the app to a
    // second Answer button, which is not what an Answer button should do.
    val answer = deepLinkIntent(context, "$route/true", REQUEST_ANSWER)

    // Tapping the notification body just opens the incoming call screen without answering.
    val open = deepLinkIntent(context, route, REQUEST_OPEN_INCOMING)
    val decline = actionIntent(context, CallActionReceiver.ACTION_DECLINE, callID)

    return baseBuilder(context, CHANNEL_INCOMING)
        // onlyAlertOnce would suppress the ring on a re-post, which is not what we want here.
        .setOnlyAlertOnce(false)
        .setStyle(NotificationCompat.CallStyle.forIncomingCall(person(callerName), decline, answer))
        .setFullScreenIntent(open, true)
        .setContentIntent(open)
        .build()
  }

  /**
   * The in-call notification, which doubles as CallService's foreground service notification.
   *
   * The duration is rendered by the system from [startTimeMs] via the chronometer rather than by
   * re-posting the notification once a second, which is what made the previous implementation
   * re-alert continuously.
   */
  fun buildOngoing(
      context: Context,
      callID: String,
      callerName: String,
      startTimeMs: Long,
      isMuted: Boolean
  ): Notification {
    val hangUp = actionIntent(context, CallActionReceiver.ACTION_HANG_UP, callID)
    val open = launchAppIntent(context, REQUEST_OPEN_ONGOING)

    val builder =
        baseBuilder(context, CHANNEL_ONGOING)
            .setStyle(NotificationCompat.CallStyle.forOngoingCall(person(callerName), hangUp))
            .setContentIntent(open)
            .setUsesChronometer(true)
            .setWhen(startTimeMs)
            .setShowWhen(true)

    if (isMuted) {
      builder.setSubText("Muted")
    }
    return builder.build()
  }

  /** Post or replace the ringing notification. */
  fun showIncoming(context: Context, callID: String, callerName: String, callerUserID: String) {
    ensureChannels(context)
    manager(context)
        .notify(NOTIFICATION_ID, buildIncoming(context, callID, callerName, callerUserID))
  }

  /** Remove whichever call notification is currently showing. */
  fun cancel(context: Context) {
    manager(context).cancel(NOTIFICATION_ID)
  }
}
