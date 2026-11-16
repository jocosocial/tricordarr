package com.tricordarr.push

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
 * The event-type to channel/title/URL/mark-as-read table. The instance lives in the generated
 * `NotificationEventTable.generated.kt`, built from `specs/NotificationEvents.json`. Do not
 * hand-edit that table; change the JSON and run `npm run codegen:notifications`.
 */
class NotificationEvents(
  val channelGroups: List<ChannelGroupSpec>,
  val channels: List<ChannelSpec>,
  val events: Map<String, EventSpec>,
)
