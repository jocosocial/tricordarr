package com.tricordarr.push

import java.io.File

/** Loads the real shared event table so the tests exercise exactly what the app bundles. */
object TestSupport {
  val events: NotificationEvents by lazy {
    // Gradle runs unit tests with the module directory (android/app) as the working directory.
    NotificationEvents.parse(File("../../specs/NotificationEvents.json").readText())
  }

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
