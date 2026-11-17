package com.tricordarr.push

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class PushAccountTest {
  @Test
  fun socketUrlSwapsScheme() {
    assertEquals("wss://twitarr.com/api/v3/notification/socket", TestSupport.account().socketUrl())
    assertEquals(
      "ws://10.0.2.2:8081/api/v3/notification/socket",
      TestSupport.account().copy(serverUrl = "http://10.0.2.2:8081").socketUrl(),
    )
  }

  @Test
  fun mayAutoStartUntilTheCruiseEnds() {
    val account = TestSupport.account()
    assertTrue(account.mayAutoStart(1_000L))
    assertTrue(account.copy(autoStartUntil = 2_000L).mayAutoStart(2_000L))
    assertFalse(account.copy(autoStartUntil = 2_000L).mayAutoStart(2_001L))
  }

  @Test
  fun autoStartUntilRoundTripsThroughJson() {
    val limited = TestSupport.account().copy(autoStartUntil = 5_000L)
    assertEquals(listOf(limited), PushAccount.listFromJson(PushAccount.listToJson(listOf(limited))))
    assertNull(PushAccount.listFromJson(PushAccount.listToJson(listOf(TestSupport.account()))).single().autoStartUntil)
  }

  @Test
  fun jsonRoundTrips() {
    val account = TestSupport.account(mapOf("seamailUnreadMsg" to true, "announcement" to false), mute = 123L)
    val parsed = PushAccount.listFromJson(PushAccount.listToJson(listOf(account)))
    assertEquals(listOf(account), parsed)
  }

  @Test
  fun parsesWhatJsSends() {
    val parsed = PushAccount.listFromJson(
      """[{"accountID":"s1","serverUrl":"https://x.test/","urlPrefix":"/api/v3","token":"t","enabled":true,
         "prefs":{"pushNotifications":{"announcement":true}}}]""",
    ).single()
    assertEquals("https://x.test", parsed.serverUrl)
    assertEquals("", parsed.username)
    assertNull(parsed.prefs.muteNotificationsUntil)
    assertEquals(true, parsed.prefs.pushNotifications["announcement"])
  }

  @Test
  fun onlyConnectionFieldsForceAReconnect() {
    val a = TestSupport.account()
    assertFalse(a.connectionDiffers(a.copy(prefs = PushPrefs(mapOf("x" to true), 5L), username = "other")))
    assertTrue(a.connectionDiffers(a.copy(token = "new")))
    assertTrue(a.connectionDiffers(a.copy(serverUrl = "https://other")))
  }
}
