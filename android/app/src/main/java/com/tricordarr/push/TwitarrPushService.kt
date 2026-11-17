package com.tricordarr.push

import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.net.ConnectivityManager
import android.net.Network
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.ServiceCompat
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import org.json.JSONObject
import java.text.DateFormat
import java.util.Date

/**
 * Foreground service that owns the notification WebSocket(s) and posts notifications natively,
 * so push keeps working with no React context (app swiped away, or after a reboot).
 *
 * One [AccountConnection] per enabled account. JS decides which accounts those are (the active
 * one, plus any that opted in to notifications while inactive) and replaces the list in
 * [PushAccountStore] through `syncPushAccounts`.
 */
class TwitarrPushService : Service(), AccountConnection.Callbacks {
  private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
  private val lock = Any()
  private val connections = mutableMapOf<String, AccountConnection>()

  private lateinit var store: PushAccountStore
  private lateinit var statusStore: PushStatusStore
  private lateinit var events: NotificationEvents
  private var networkCallback: ConnectivityManager.NetworkCallback? = null
  private var loopStarted = false

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onCreate() {
    super.onCreate()
    store = PushAccountStore(this)
    statusStore = PushStatusStore(this)
    events = NotificationEventTable.table
    PushChannels.ensure(this, events)
    running = true
  }

  /** What the service notification last showed, so an unchanged refresh does not repost it. */
  private var lastNotificationContent: List<String?>? = null

  /** Set once this instance has entered the foreground, so later start requests leave the notification alone. */
  private var inForeground = false

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    if (!inForeground) {
      try {
        enterForeground()
      } catch (e: Exception) {
        // ForegroundServiceStartNotAllowedException and friends: we were started from a context
        // Android does not allow. Ask the user to open the app instead of crashing.
        Log.w(TAG, "Unable to enter the foreground", e)
        NotificationBuilder.postReconnectNeeded(this)
        stopSelf()
        return START_NOT_STICKY
      }
    }
    NotificationBuilder.cancelReconnectNeeded(this)
    // A start request means the app was opened (or the phone booted), so retry accounts that gave up.
    reconcile(restartGaveUp = true)
    startLoopsOnce()
    return START_STICKY
  }

  /** Shows the placeholder notification and promotes the service. Throws if Android refuses. */
  private fun enterForeground() {
    // The placeholder below replaces whatever was showing, so the next refresh must repost.
    lastNotificationContent = null
    val type = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
      ServiceInfo.FOREGROUND_SERVICE_TYPE_REMOTE_MESSAGING
    } else {
      ServiceInfo.FOREGROUND_SERVICE_TYPE_MANIFEST
    }
    ServiceCompat.startForeground(
      this,
      NotificationBuilder.SERVICE_NOTIFICATION_ID,
      NotificationBuilder.serviceNotification(this, null, "Connecting to the Twitarr server"),
      type,
    )
    inForeground = true
  }

  override fun onDestroy() {
    running = false
    networkCallback?.let {
      runCatching { (getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager).unregisterNetworkCallback(it) }
    }
    synchronized(lock) {
      connections.values.forEach { it.stop() }
      connections.clear()
    }
    scope.cancel()
    super.onDestroy()
  }

  private fun startLoopsOnce() {
    if (loopStarted) return
    loopStarted = true
    val manager = getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
    val callback = object : ConnectivityManager.NetworkCallback() {
      override fun onAvailable(network: Network) {
        synchronized(lock) { connections.values.forEach { it.kick() } }
      }
    }
    networkCallback = callback
    runCatching { manager.registerDefaultNetworkCallback(callback) }
      .onFailure { Log.w(TAG, "Unable to watch connectivity", it) }

    // Picks up store changes JS made while we are running, and drives the healthcheck.
    scope.launch {
      while (isActive) {
        delay(RECONCILE_INTERVAL_MS)
        reconcile()
        synchronized(lock) { connections.values.forEach { it.healthcheck() } }
      }
    }
  }

  /**
   * Makes the running connections match the enabled accounts in the store. [restartGaveUp] also
   * restarts accounts that gave up, which is what opening the app asks for.
   */
  private fun reconcile(restartGaveUp: Boolean = false) {
    val accounts = store.load().filter { it.enabled }
    if (accounts.isEmpty()) {
      Log.d(TAG, "No enabled accounts. Stopping.")
      statusStore.retainOnly(emptySet())
      stopSelf()
      return
    }
    synchronized(lock) {
      val wanted = accounts.map { it.accountID }.toSet()
      connections.keys.filter { it !in wanted }.forEach {
        connections.remove(it)?.stop()
        NotificationBuilder.cancelConnectionLost(this, it)
      }
      for (account in accounts) {
        val existing = connections[account.accountID]
        if (existing != null && !existing.account.connectionDiffers(account) && !(restartGaveUp && existing.isGaveUp)) {
          // Only prefs (or username) changed, no need to reconnect.
          existing.account = account
          continue
        }
        existing?.stop()
        val connection = AccountConnection(
          account,
          statusStore.get(account.accountID),
          scope,
          PushHttp.socketClient(this),
          this,
        )
        connections[account.accountID] = connection
        connection.start()
      }
      statusStore.retainOnly(wanted)
      if (connections.values.all { it.isTerminal }) {
        Log.d(TAG, "Every account is revoked. Stopping.")
        stopSelf()
      }
    }
    refreshServiceNotification()
  }

  /**
   * Rewrites the service notification from the connection states. It shows when each open socket
   * was last confirmed alive, as an absolute time, because the system's own timestamp renders as a
   * relative "Now" that goes stale. The oldest check wins, so a quiet account is not hidden by a
   * busy one. Reposts only when the text changes, which is once a minute at most.
   */
  private fun refreshServiceNotification() {
    val connected = synchronized(lock) {
      connections.values.filter { it.status.state == SocketState.OPEN }.map { it.account to it.status.lastHealthcheckAt }
    }
    val accounts = connected.map { it.first }
    val labels = accounts.map { it.label() }
    val single = accounts.singleOrNull()
    val checked = connected.mapNotNull { it.second }.minOrNull()
      ?.let { DateFormat.getTimeInstance(DateFormat.SHORT).format(Date(it)) }
    val subText = when {
      single != null -> single.name()
      labels.isEmpty() -> null
      else -> listOfNotNull("${labels.size} accounts", checked).joinToString(" · ")
    }
    val text = when {
      single != null -> listOfNotNull("Connected to ${single.host()}", checked?.let { "checked $it" }).joinToString(" · ")
      labels.isEmpty() -> "Waiting to connect to the Twitarr server"
      else -> labels.joinToString(", ")
    }
    // The collapsed row runs several accounts together on one line; expanding gives each its own.
    val expanded = if (labels.size > 1) labels.joinToString("\n") else null
    val content = listOf(subText, text, expanded)
    if (running && content != lastNotificationContent) {
      if (NotificationBuilder.updateServiceNotification(this, subText, text, expanded)) {
        lastNotificationContent = content
      }
    }
  }

  override fun onStatus(status: AccountStatus) {
    statusStore.put(status)
    PushEvents.listener?.onBackgroundStatusChanged(status)
    if (status.state == SocketState.OPEN || status.state == SocketState.CLOSED || status.state == SocketState.REVOKED) {
      refreshServiceNotification()
    }
  }

  override fun onMessage(connection: AccountConnection, text: String) {
    val account = connection.account
    val data = runCatching { JSONObject(text) }.getOrNull()
    val type = data?.let { NotificationPlanner.typeOf(it) } ?: "unknown"
    NotificationLogWriter.append(this, account.accountID, type, text, data)
    PushEvents.listener?.onNotificationSocketEvent(account.accountID, text)

    when (val result = NotificationPlanner.plan(events, account, text, System.currentTimeMillis())) {
      is PlanResult.Post -> {
        val multi = synchronized(lock) { connections.size } > 1
        NotificationBuilder.post(this, result.plan, if (multi) account.username else null)
      }
      is PlanResult.Dismiss -> NotificationBuilder.cancelContent(this, result.accountID, result.contentID)
      is PlanResult.Skip -> Log.d(TAG, "Not notifying: ${result.reason}")
    }
  }

  override fun onGaveUp(account: PushAccount) {
    NotificationBuilder.postConnectionLost(this, account.accountID, account.label())
    val allDone = synchronized(lock) { connections.values.all { it.isTerminal } }
    if (allDone) {
      Log.d(TAG, "Every account is revoked or gave up. Stopping.")
      stopSelf()
    } else {
      refreshServiceNotification()
    }
  }

  override fun onRecovered(account: PushAccount) {
    NotificationBuilder.cancelConnectionLost(this, account.accountID)
  }

  companion object {
    private const val TAG = "TwitarrPushService"
    private const val RECONCILE_INTERVAL_MS = 30_000L

    /** True while this process has the service alive. A stale persisted "Open" is not trusted without it. */
    @Volatile
    var running = false
      private set
  }
}
