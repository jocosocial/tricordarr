package com.tricordarr.push

/** Uses the real generated event table so the tests exercise exactly what the app ships. */
object TestSupport {
  val events: NotificationEvents = NotificationEventTable.table

  fun account(
    types: Map<String, Boolean> = emptyMap(),
    mute: Long? = null,
  ) = PushAccount(
    accountID = "acct-1",
    userID = "7",
    username = "grant",
    serverUrl = "https://twitarr.com",
    urlPrefix = "/api/v3",
    token = "tok",
    enabled = true,
    prefs = PushPrefs(types, mute),
  )
}
