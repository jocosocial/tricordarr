package com.tricordarr.push

import android.app.NotificationManager
import android.content.Context
import android.os.Build
import androidx.core.app.NotificationManagerCompat

/**
 * Creates the notification channels and groups natively, so notifications can be posted when the
 * service starts from boot with no JS having run. Channel IDs and group membership come from the
 * generated event table and must not change: a channel's group binding is immutable, and creating
 * an existing channel is a no-op that preserves the user's customizations.
 */
object PushChannels {
  fun ensure(context: Context, events: NotificationEvents) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return
    }
    val manager = NotificationManagerCompat.from(context)
    events.channelGroups.forEach { group ->
      val compat = androidx.core.app.NotificationChannelGroupCompat.Builder(group.id)
        .setName(group.name)
        .setDescription(group.description)
        .build()
      manager.createNotificationChannelGroup(compat)
    }
    events.channels.forEach { channel ->
      val builder = androidx.core.app.NotificationChannelCompat.Builder(channel.id, NotificationManager.IMPORTANCE_DEFAULT)
        .setName(channel.name)
        .setDescription(channel.description)
        .setGroup(channel.groupId)
        .setShowBadge(channel.badge)
      channel.vibrationPattern?.let {
        builder.setVibrationEnabled(true)
        builder.setVibrationPattern(it)
      }
      manager.createNotificationChannel(builder.build())
    }
  }
}
