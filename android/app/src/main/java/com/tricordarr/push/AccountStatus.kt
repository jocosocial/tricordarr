package com.tricordarr.push

import org.json.JSONObject

/** Socket states reported to JS. These match the strings the iOS status uses where they overlap. */
object SocketState {
  const val CONNECTING = "Connecting"
  const val OPEN = "Open"
  const val CLOSED = "Closed"
  const val REVOKED = "Revoked"
  const val STOPPED = "Stopped"
}

/** Persisted per-account health, the shape JS receives as `PerAccountStatus`. Timestamps are epoch milliseconds. */
data class AccountStatus(
  val accountID: String,
  val state: String = SocketState.CLOSED,
  val lastHealthcheckAt: Long? = null,
  val lastHealthcheckSuccess: Boolean? = null,
  val failedCount: Int = 0,
  val startedAt: Long? = null,
  val lastError: String? = null,
  val lastErrorAt: Long? = null,
) {
  fun toJson(): JSONObject =
    JSONObject().apply {
      put("accountID", accountID)
      put("state", state)
      put("failedCount", failedCount)
      lastHealthcheckAt?.let { put("lastHealthcheckAt", it) }
      lastHealthcheckSuccess?.let { put("lastHealthcheckSuccess", it) }
      startedAt?.let { put("startedAt", it) }
      lastError?.let { put("lastError", it) }
      lastErrorAt?.let { put("lastErrorAt", it) }
    }

  companion object {
    /** Reads an epoch-millis field, treating a missing or non-numeric value as absent. */
    private fun JSONObject.optMillis(key: String): Long? = optLong(key, -1L).takeIf { it >= 0 }

    fun fromJson(json: JSONObject): AccountStatus =
      AccountStatus(
        accountID = json.getString("accountID"),
        state = json.optString("state", SocketState.CLOSED),
        lastHealthcheckAt = json.optMillis("lastHealthcheckAt"),
        lastHealthcheckSuccess = if (json.has("lastHealthcheckSuccess")) json.getBoolean("lastHealthcheckSuccess") else null,
        failedCount = json.optInt("failedCount", 0),
        startedAt = json.optMillis("startedAt"),
        lastError = json.optString("lastError").ifEmpty { null },
        lastErrorAt = json.optMillis("lastErrorAt"),
      )
  }
}

/**
 * Pure state machine for one account's connection health. Android-free so it can be unit tested.
 * Every transition returns the new [AccountStatus]; the caller persists it.
 */
class HealthTracker(
  private val accountID: String,
  initial: AccountStatus? = null,
  private val failureThreshold: Int = DEFAULT_FAILURE_THRESHOLD,
  private val clock: () -> Long = System::currentTimeMillis,
) {
  var status: AccountStatus = initial ?: AccountStatus(accountID)
    private set

  /** True once per outage, when consecutive failures first reach the threshold. */
  var connectionLostPending: Boolean = false
    private set

  private var connectionLostNotified = false

  fun onStarted(): AccountStatus = update(status.copy(state = SocketState.CONNECTING, startedAt = clock(), failedCount = 0))

  fun onConnecting(): AccountStatus = update(status.copy(state = SocketState.CONNECTING))

  fun onOpen(): AccountStatus {
    connectionLostNotified = false
    connectionLostPending = false
    return update(
      status.copy(
        state = SocketState.OPEN,
        failedCount = 0,
        lastHealthcheckAt = clock(),
        lastHealthcheckSuccess = true,
      ),
    )
  }

  /** Any traffic on an open socket proves it is alive. */
  fun onMessage(): AccountStatus = update(status.copy(lastHealthcheckAt = clock(), lastHealthcheckSuccess = true))

  fun onFailure(error: String?): AccountStatus {
    val now = clock()
    val failed = status.failedCount + 1
    if (failed >= failureThreshold && !connectionLostNotified) {
      connectionLostNotified = true
      connectionLostPending = true
    }
    return update(
      status.copy(
        state = SocketState.CLOSED,
        failedCount = failed,
        lastHealthcheckAt = now,
        lastHealthcheckSuccess = false,
        lastError = error ?: status.lastError,
        lastErrorAt = if (error != null) now else status.lastErrorAt,
      ),
    )
  }

  /** The server closed the socket cleanly. Not a failure, but the socket is no longer open. */
  fun onClosed(): AccountStatus = update(status.copy(state = SocketState.CLOSED))

  /** The server rejected our token. Terminal until JS syncs new credentials. */
  fun onRevoked(): AccountStatus =
    update(status.copy(state = SocketState.REVOKED, lastHealthcheckAt = clock(), lastHealthcheckSuccess = false))

  /** The service is going away. A revoked token stays revoked so JS can still tell the user. */
  fun onStopped(): AccountStatus = if (status.state == SocketState.REVOKED) status else update(status.copy(state = SocketState.STOPPED))

  /** Marks the pending connection-lost notification as delivered. */
  fun consumeConnectionLost(): Boolean {
    val pending = connectionLostPending
    connectionLostPending = false
    return pending
  }

  private fun update(next: AccountStatus): AccountStatus {
    status = next
    return next
  }

  companion object {
    const val DEFAULT_FAILURE_THRESHOLD = 10
  }
}
