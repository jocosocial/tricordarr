package com.tricordarr.push

import kotlin.math.min
import kotlin.random.Random

/** Exponential reconnect backoff, 1s doubling up to 30s, with +/-20% jitter. */
object Backoff {
  const val MIN_DELAY_MS = 1_000L
  const val MAX_DELAY_MS = 30_000L

  /** The un-jittered delay before reconnect attempt number [attempt] (0 is the first retry). */
  fun baseDelayMs(attempt: Int): Long {
    val shift = min(attempt.coerceAtLeast(0), 20)
    return min(MIN_DELAY_MS shl shift, MAX_DELAY_MS)
  }

  fun delayMs(attempt: Int, random: Random = Random.Default): Long {
    val base = baseDelayMs(attempt)
    val jitter = (base * 0.2 * (random.nextDouble() * 2 - 1)).toLong()
    return (base + jitter).coerceIn(MIN_DELAY_MS / 2, MAX_DELAY_MS + MAX_DELAY_MS / 5)
  }
}
