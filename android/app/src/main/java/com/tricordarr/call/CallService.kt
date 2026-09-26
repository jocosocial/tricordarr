package com.tricordarr.call

import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import android.util.Log

/**
 * Foreground service that backs an active KrakenTalk call.
 *
 * Exists so that the call owns a `microphone`-typed foreground service of its own. Two things
 * follow from that. First, the microphone keeps working when the app is backgrounded on Android
 * 14+, which requires an FGS of type microphone or phoneCall. Second, the call no longer shares
 * the app's notification library's single foreground service with the background socket worker,
 * where the call notification was being silently dropped whenever the worker got there first.
 *
 * The service owns [CallAudioEngine]'s lifetime: it starts the engine before calling
 * startForeground() and stops it in onDestroy(), so microphone capture can never outlive the
 * foreground service that legitimises it.
 *
 * Note that a ringing call does *not* run this service. No microphone is in use while ringing and
 * starting a microphone-typed FGS from the background is restricted, so the ringing state is just
 * a notification (see [CallNotifications.showIncoming]) and the service starts on answer.
 */
class CallService : Service() {

  private var callID: String? = null
  private var callerName: String = "Unknown"
  private var startTimeMs: Long = 0L
  private var isMuted: Boolean = false

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    when (intent?.action) {
      ACTION_START -> handleStart(intent)
      ACTION_UPDATE -> handleUpdate(intent)
      ACTION_STOP -> {
        stopSelf()
        return START_NOT_STICKY
      }
      else -> Log.w(TAG, "Ignoring unknown action ${intent?.action}")
    }
    // Do not recreate the service if the process is killed: a call cannot meaningfully survive it,
    // and a restarted service would hold the microphone with no call behind it.
    return START_NOT_STICKY
  }

  private fun handleStart(intent: Intent) {
    // Default the id rather than bailing early. This service is launched with
    // startForegroundService(), which obliges us to call startForeground() promptly or be killed
    // with an exception, so every path through here has to reach startForegroundWithOngoing().
    callID = intent.getStringExtra(EXTRA_CALL_ID) ?: ""
    callerName = intent.getStringExtra(EXTRA_CALLER_NAME) ?: "Unknown"
    startTimeMs = intent.getLongExtra(EXTRA_START_TIME, System.currentTimeMillis())
    isMuted = intent.getBooleanExtra(EXTRA_IS_MUTED, false)

    CallNotifications.ensureChannels(this)
    startForegroundWithOngoing()
    isRunning = true

    if (callID.isNullOrEmpty()) {
      Log.e(TAG, "ACTION_START without a call ID; stopping")
      stopSelf()
      return
    }

    try {
      CallAudioEngine.start(this)
    } catch (e: Exception) {
      Log.e(TAG, "Failed to start audio engine: ${e.message}")
      stopSelf()
    }
  }

  private fun handleUpdate(intent: Intent) {
    if (callID.isNullOrEmpty()) {
      Log.w(TAG, "ACTION_UPDATE before ACTION_START; ignoring")
      return
    }
    isMuted = intent.getBooleanExtra(EXTRA_IS_MUTED, isMuted)
    startForegroundWithOngoing()
  }

  /**
   * Post (or replace) the in-call notification as this service's foreground notification.
   *
   * Uses the same notification id as the ringing notification so that answering transitions the
   * existing entry in place rather than stacking a second one.
   */
  private fun startForegroundWithOngoing() {
    val id = callID ?: return
    val notification =
        CallNotifications.buildOngoing(this, id, callerName, startTimeMs, isMuted)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      startForeground(
          CallNotifications.NOTIFICATION_ID,
          notification,
          ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE)
    } else {
      startForeground(CallNotifications.NOTIFICATION_ID, notification)
    }
  }

  override fun onDestroy() {
    Log.d(TAG, "Destroying call service")
    isRunning = false
    CallAudioEngine.stop(this)
    CallNotifications.cancel(this)
    callID = null
    super.onDestroy()
  }

  companion object {
    private const val TAG = "CallService"

    /** Whether a call service instance is currently running. See [update]. */
    @Volatile private var isRunning = false

    const val ACTION_START = "com.tricordarr.call.START"
    const val ACTION_UPDATE = "com.tricordarr.call.UPDATE"
    const val ACTION_STOP = "com.tricordarr.call.STOP"

    const val EXTRA_CALL_ID = "callID"
    const val EXTRA_CALLER_NAME = "callerName"
    const val EXTRA_START_TIME = "startTime"
    const val EXTRA_IS_MUTED = "isMuted"

    /** Start the call service and its audio engine. Called when a call becomes active. */
    fun start(context: Context, callID: String, callerName: String, startTimeMs: Long) {
      val intent =
          Intent(context, CallService::class.java).apply {
            action = ACTION_START
            putExtra(EXTRA_CALL_ID, callID)
            putExtra(EXTRA_CALLER_NAME, callerName)
            putExtra(EXTRA_START_TIME, startTimeMs)
          }
      ContextCompatStartForegroundService(context, intent)
    }

    /**
     * Refresh the in-call notification, e.g. after the mute state changes.
     *
     * Does nothing if no call is running. This must not be the call that starts the service:
     * ACTION_UPDATE does not call startForeground(), and Android kills a service started via
     * startForegroundService() that fails to reach startForeground() within a few seconds.
     */
    fun update(context: Context, isMuted: Boolean) {
      if (!isRunning) {
        return
      }
      val intent =
          Intent(context, CallService::class.java).apply {
            action = ACTION_UPDATE
            putExtra(EXTRA_IS_MUTED, isMuted)
          }
      ContextCompatStartForegroundService(context, intent)
    }

    /** Stop the call service, which tears down the audio engine and clears the notification. */
    fun stop(context: Context) {
      context.stopService(Intent(context, CallService::class.java))
    }

    private fun ContextCompatStartForegroundService(context: Context, intent: Intent) {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        context.startForegroundService(intent)
      } else {
        context.startService(intent)
      }
    }
  }
}
