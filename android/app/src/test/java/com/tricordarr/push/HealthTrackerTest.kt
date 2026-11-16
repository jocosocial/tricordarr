package com.tricordarr.push

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class HealthTrackerTest {
  private fun tracker(threshold: Int = 3) = HealthTracker("a", failureThreshold = threshold, clock = { 0L })

  @Test
  fun openResetsFailures() {
    val t = tracker()
    t.onFailure("x")
    t.onFailure("x")
    val status = t.onOpen()
    assertEquals(SocketState.OPEN, status.state)
    assertEquals(0, status.failedCount)
    assertEquals(true, status.lastHealthcheckSuccess)
  }

  @Test
  fun connectionLostFiresOncePerOutage() {
    val t = tracker(threshold = 3)
    t.onFailure("x")
    t.onFailure("x")
    assertFalse(t.consumeConnectionLost())
    t.onFailure("x")
    assertTrue(t.consumeConnectionLost())
    t.onFailure("x")
    assertFalse(t.consumeConnectionLost())
    t.onOpen()
    repeat(3) { t.onFailure("x") }
    assertTrue(t.consumeConnectionLost())
  }

  @Test
  fun givesUpAfterEnoughConsecutiveFailures() {
    val t = HealthTracker("a", giveUpAfterFailures = 3, clock = { 0L })
    assertFalse(t.shouldGiveUp())
    t.onFailure("x")
    t.onFailure("x")
    assertFalse(t.shouldGiveUp())
    t.onFailure("x")
    assertTrue(t.shouldGiveUp())
    assertEquals(SocketState.STOPPED, t.onGaveUp().state)
  }

  @Test
  fun aSuccessfulConnectionRestartsTheFailureCount() {
    val t = HealthTracker("a", giveUpAfterFailures = 3, clock = { 0L })
    t.onFailure("x")
    t.onFailure("x")
    t.onOpen()
    t.onFailure("x")
    assertFalse(t.shouldGiveUp())
  }

  @Test
  fun failureRecordsTheError() {
    val status = tracker().onFailure("boom")
    assertEquals(SocketState.CLOSED, status.state)
    assertEquals("boom", status.lastError)
    assertEquals(1, status.failedCount)
    assertEquals(false, status.lastHealthcheckSuccess)
  }

  @Test
  fun revokedSurvivesStop() {
    val t = tracker()
    t.onRevoked()
    assertEquals(SocketState.REVOKED, t.onStopped().state)
  }

  @Test
  fun stopMovesToStopped() {
    val t = tracker()
    t.onOpen()
    assertEquals(SocketState.STOPPED, t.onStopped().state)
  }
}
