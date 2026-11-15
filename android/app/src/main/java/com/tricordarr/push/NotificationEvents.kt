package com.tricordarr.push

import android.content.Context
import org.json.JSONObject

data class ChannelGroupSpec(val id: String, val name: String, val description: String)

data class ChannelSpec(
  val id: String,
  val name: String,
  val groupId: String,
  val description: String,
  val badge: Boolean,
  val vibrationPattern: LongArray?,
)

data class EventSpec(
  val type: String,
  val channel: String,
  val title: String,
  /** Path template with `{contentID}`, `{callerUserID}` and `{callerUsername}`. Null means just open the app. */
  val url: String?,
  val markAsReadUrl: String?,
  val autoCancel: Boolean,
  val ongoing: Boolean,
  val messaging: Boolean,
)

/**
 * The event-type to channel/title/URL/mark-as-read table, loaded from the shared
 * `specs/NotificationEvents.json` (bundled as an asset by the app Gradle build). Do not hand-copy
 * this table into Kotlin; TS, Swift and Kotlin all derive from the one JSON file.
 */
class NotificationEvents(
  val channelGroups: List<ChannelGroupSpec>,
  val channels: List<ChannelSpec>,
  val events: Map<String, EventSpec>,
) {
  companion object {
    const val ASSET_NAME = "NotificationEvents.json"

    fun load(context: Context): NotificationEvents =
      parse(context.assets.open(ASSET_NAME).bufferedReader().use { it.readText() })

    fun parse(text: String): NotificationEvents {
      val root = JSONObject(text)
      val groups = root.getJSONObject("channelGroups").let { json ->
        json.keys().asSequence().map { id ->
          val group = json.getJSONObject(id)
          ChannelGroupSpec(id, group.getString("name"), group.getString("description"))
        }.toList()
      }
      val channels = root.getJSONObject("channels").let { json ->
        json.keys().asSequence().map { id ->
          val channel = json.getJSONObject(id)
          val pattern = channel.optJSONArray("vibrationPattern")?.let { array ->
            LongArray(array.length()) { array.getLong(it) }
          }
          ChannelSpec(
            id = id,
            name = channel.getString("name"),
            groupId = channel.getString("group"),
            description = channel.getString("description"),
            badge = channel.optBoolean("badge", true),
            vibrationPattern = pattern,
          )
        }.toList()
      }
      val events = root.getJSONObject("events").let { json ->
        json.keys().asSequence().associateWith { type ->
          val event = json.getJSONObject(type)
          EventSpec(
            type = type,
            channel = event.getString("channel"),
            title = event.getString("title"),
            url = event.optString("url").ifEmpty { null },
            markAsReadUrl = event.optString("markAsReadUrl").ifEmpty { null },
            autoCancel = event.optBoolean("autoCancel", true),
            ongoing = event.optBoolean("ongoing", false),
            messaging = event.optBoolean("messaging", false),
          )
        }
      }
      return NotificationEvents(groups, channels, events)
    }
  }
}
