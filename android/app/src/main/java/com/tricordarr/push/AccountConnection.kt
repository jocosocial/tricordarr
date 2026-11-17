package com.tricordarr.push

import android.util.Log
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.withTimeoutOrNull
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener

/**
 * One account's notification socket: connects, reconnects with backoff, tracks health, and
 * reports through [Callbacks]. A 401 on the handshake means the token was revoked (e.g. by
 * Swiftarr `/auth/logout`), which ends the loop instead of retrying forever.
 */
class AccountConnection(
  @Volatile var account: PushAccount,
  initialStatus: AccountStatus?,
  private val scope: CoroutineScope,
  private val client: OkHttpClient,
  private val callbacks: Callbacks,
) {
  interface Callbacks {
    fun onStatus(status: AccountStatus)

    fun onMessage(connection: AccountConnection, text: String)

    fun onRecovered(account: PushAccount)

    /** The account was unreachable for too long and has stopped retrying. */
    fun onGaveUp(account: PushAccount)
  }

  private sealed class Outcome {
    data class Ended(val openedFor: Long?, val error: String?) : Outcome()

    object Revoked : Outcome()
  }

  private val tracker = HealthTracker(account.accountID, initialStatus)
  private val kicks = Channel<Unit>(Channel.CONFLATED)
  private var job: Job? = null

  @Volatile
  private var socket: WebSocket? = null

  val status: AccountStatus get() = synchronized(tracker) { tracker.status }

  /** True once the connection has stopped retrying, until the app is opened or credentials change. */
  @Volatile
  var isGaveUp: Boolean = false
    private set

  /** True once the token has been rejected or retrying was given up; nothing more happens on its own. */
  val isTerminal: Boolean get() = status.state == SocketState.REVOKED || isGaveUp

  fun start() {
    job = scope.launch { run() }
  }

  fun stop() {
    job?.cancel()
    socket?.cancel()
    publish { tracker.onStopped() }
  }

  /** Reconnect now if waiting out a backoff, e.g. because the network just came back. */
  fun kick() {
    kicks.trySend(Unit)
  }

  /** Called from the service's periodic loop. An open socket that survived to here is healthy. */
  fun healthcheck() {
    if (status.state == SocketState.OPEN) {
      publish { tracker.onMessage() }
    }
  }

  private fun publish(transition: () -> AccountStatus) {
    val next = synchronized(tracker) { transition() }
    callbacks.onStatus(next)
  }

  private suspend fun run() {
    var attempt = 0
    publish { tracker.onStarted() }
    while (currentCoroutineContext().isActive) {
      kicks.tryReceive()
      publish { tracker.onConnecting() }
      when (val outcome = connectOnce()) {
        is Outcome.Revoked -> {
          publish { tracker.onRevoked() }
          return
        }
        is Outcome.Ended -> {
          if (outcome.error != null) {
            publish { tracker.onFailure(outcome.error) }
            if (synchronized(tracker) { tracker.shouldGiveUp() }) {
              Log.i(TAG, "Giving up on ${account.accountID} after repeated failures")
              isGaveUp = true
              publish { tracker.onGaveUp() }
              callbacks.onGaveUp(account)
              return
            }
          } else {
            publish { tracker.onClosed() }
          }
          // A socket that stayed up for a while was healthy, so start the backoff over.
          attempt = if ((outcome.openedFor ?: 0L) >= STABLE_MS) 0 else attempt + 1
        }
      }
      withTimeoutOrNull(Backoff.delayMs(attempt)) { kicks.receive() }
    }
  }

  private suspend fun connectOnce(): Outcome {
    val done = CompletableDeferred<Outcome>()
    var openedAt: Long? = null
    val request = Request.Builder()
      .url(account.socketUrl().replaceFirst("wss://", "https://").replaceFirst("ws://", "http://"))
      .header("Authorization", "Bearer ${account.token}")
      .build()
    val ws = client.newWebSocket(
      request,
      object : WebSocketListener() {
        override fun onOpen(webSocket: WebSocket, response: Response) {
          openedAt = System.currentTimeMillis()
          publish { tracker.onOpen() }
          callbacks.onRecovered(account)
        }

        override fun onMessage(webSocket: WebSocket, text: String) {
          publish { tracker.onMessage() }
          callbacks.onMessage(this@AccountConnection, text)
        }

        override fun onClosing(webSocket: WebSocket, code: Int, reason: String) {
          webSocket.close(code, null)
          done.complete(Outcome.Ended(elapsed(), null))
        }

        override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
          done.complete(Outcome.Ended(elapsed(), null))
        }

        override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
          if (response?.code == 401) {
            done.complete(Outcome.Revoked)
          } else {
            Log.w(TAG, "Socket failure for ${account.accountID}: ${t.message}")
            done.complete(Outcome.Ended(elapsed(), t.message ?: t.javaClass.simpleName))
          }
        }

        private fun elapsed(): Long? = openedAt?.let { System.currentTimeMillis() - it }
      },
    )
    socket = ws
    try {
      return done.await()
    } finally {
      ws.cancel()
      socket = null
    }
  }

  companion object {
    private const val TAG = "AccountConnection"
    private const val STABLE_MS = 10_000L
  }
}
