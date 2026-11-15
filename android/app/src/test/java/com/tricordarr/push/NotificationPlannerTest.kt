package com.tricordarr.push

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class NotificationPlannerTest {
  private val events = TestSupport.events
  private val all = events.events.keys.associateWith { true }

  private fun post(raw: String, account: PushAccount = TestSupport.account(all)): NotificationPlan {
    val result = NotificationPlanner.plan(events, account, raw, 0L)
    assertTrue("expected a post but got $result", result is PlanResult.Post)
    return (result as PlanResult.Post).plan
  }

  @Test
  fun seamailMapsToChannelUrlAndMarkAsRead() {
    val plan = post("""{"type":{"seamailUnreadMsg":{}},"info":"**Hi** there","contentID":"abc"}""")
    assertEquals("seamail", plan.channelID)
    assertEquals("New Seamail", plan.title)
    assertEquals("Hi there", plan.body)
    assertEquals("tricordarr://seamail/abc?account=acct-1", plan.deepLink)
    assertEquals("/fez/abc", plan.markAsReadUrl)
    assertTrue(plan.messaging)
    assertEquals("acct:acct-1", plan.tag)
  }

  @Test
  fun privateEventChatGoesToTheChatScreen() {
    val plan = post("""{"type":{"privateEventUnreadMsg":{}},"info":"x","contentID":"9"}""")
    assertEquals("tricordarr://privateevent/9/chat?account=acct-1", plan.deepLink)
  }

  @Test
  fun incomingCallIsOngoingWithCallerInUrl() {
    val plan = post(
      """{"type":{"incomingPhoneCall":{}},"info":"x","contentID":"c1","caller":{"userID":42,"username":"bob"}}""",
    )
    assertTrue(plan.ongoing)
    assertEquals(false, plan.autoCancel)
    assertEquals("tricordarr://phonecall/c1/from/42/bob?account=acct-1", plan.deepLink)
  }

  @Test
  fun incomingCallWithoutCallerOpensTheApp() {
    val plan = post("""{"type":{"incomingPhoneCall":{}},"info":"x","contentID":"c1"}""")
    assertNull(plan.deepLink)
  }

  @Test
  fun phoneCallEndedHasNoUrl() {
    assertNull(post("""{"type":{"phoneCallEnded":{}},"info":"x","contentID":"c1"}""").deepLink)
  }

  @Test
  fun secondaryContentIDIsKept() {
    val plan = post("""{"type":{"alertwordPost":{}},"info":"x","contentID":"p1","secondaryContentID":"f1"}""")
    assertEquals("f1", plan.secondaryContentID)
    assertEquals("tricordarr://forum/containingpost/p1?account=acct-1", plan.deepLink)
  }

  @Test
  fun disabledCategoryIsSkipped() {
    val account = TestSupport.account(all + ("seamailUnreadMsg" to false))
    val result = NotificationPlanner.plan(events, account, """{"type":{"seamailUnreadMsg":{}},"contentID":"a"}""", 0L)
    assertTrue(result is PlanResult.Skip)
  }

  @Test
  fun missingCategoryIsTreatedAsDisabled() {
    val result = NotificationPlanner.plan(events, TestSupport.account(), """{"type":{"announcement":{}},"contentID":"a"}""", 0L)
    assertTrue(result is PlanResult.Skip)
  }

  @Test
  fun muteSkipsUntilItExpires() {
    val account = TestSupport.account(all, mute = 1_000L)
    val raw = """{"type":{"announcement":{}},"info":"x","contentID":"a"}"""
    assertTrue(NotificationPlanner.plan(events, account, raw, 999L) is PlanResult.Skip)
    assertTrue(NotificationPlanner.plan(events, account, raw, 1_000L) is PlanResult.Post)
  }

  @Test
  fun typesWithoutATableEntryAreSkipped() {
    val account = TestSupport.account(mapOf("phoneCallAnswered" to true))
    val result = NotificationPlanner.plan(events, account, """{"type":{"phoneCallAnswered":{}},"contentID":"a"}""", 0L)
    assertTrue(result is PlanResult.Skip)
  }

  @Test
  fun garbageIsSkipped() {
    assertTrue(NotificationPlanner.plan(events, TestSupport.account(all), "not json", 0L) is PlanResult.Skip)
    assertTrue(NotificationPlanner.plan(events, TestSupport.account(all), """{"info":"x"}""", 0L) is PlanResult.Skip)
  }

  @Test
  fun stripMarkdownRemovesFormatting() {
    assertEquals("a link and bold", NotificationPlanner.stripMarkdown("a [link](http://x) and **bold**"))
    assertEquals("Title", NotificationPlanner.stripMarkdown("## Title"))
  }

  @Test
  fun everyEventReferencesAKnownChannel() {
    val channelIDs = events.channels.map { it.id }.toSet()
    events.events.values.forEach { assertTrue("${it.type} -> ${it.channel}", it.channel in channelIDs) }
    val groupIDs = events.channelGroups.map { it.id }.toSet()
    events.channels.forEach { assertTrue("${it.id} -> ${it.groupId}", it.groupId in groupIDs) }
  }
}
