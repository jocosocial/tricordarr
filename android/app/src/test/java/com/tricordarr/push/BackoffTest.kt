package com.tricordarr.push

import kotlin.random.Random
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class BackoffTest {
  @Test
  fun baseDoublesFromOneSecondAndCapsAtThirty() {
    assertEquals(listOf(1_000L, 2_000L, 4_000L, 8_000L, 16_000L, 30_000L, 30_000L), (0..6).map { Backoff.baseDelayMs(it) })
  }

  @Test
  fun hugeAttemptCountsDoNotOverflow() {
    assertEquals(30_000L, Backoff.baseDelayMs(10_000))
  }

  @Test
  fun jitterStaysWithinTwentyPercent() {
    val random = Random(1)
    repeat(200) { attempt ->
      val base = Backoff.baseDelayMs(attempt % 8)
      val delay = Backoff.delayMs(attempt % 8, random)
      assertTrue("$delay vs $base", delay >= base * 0.8 - 1 && delay <= base * 1.2 + 1)
    }
  }
}
