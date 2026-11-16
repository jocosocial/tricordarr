package com.tricordarr.push

import android.app.Service
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.ServiceCompat

/**
 * Foreground service that keeps the process alive, and shows the ongoing notification, while a
 * KrakenTalk call is active. Started and updated through [CallServiceController].
 */
class CallService : Service() {
  override fun onBind(intent: Intent?): IBinder? = null

  override fun onCreate() {
    super.onCreate()
    PushChannels.ensure(this, NotificationEvents.load(this))
    running = true
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    val notification = NotificationBuilder.callNotification(
      this,
      intent?.getStringExtra(CallServiceController.EXTRA_REMOTE_USERNAME).orEmpty(),
      intent?.getLongExtra(CallServiceController.EXTRA_STARTED_AT, System.currentTimeMillis())
        ?: System.currentTimeMillis(),
      intent?.getBooleanExtra(CallServiceController.EXTRA_MUTED, false) ?: false,
    )
    try {
      // Microphone keeps call audio capture running while the app is backgrounded (Android 11+
      // silences AudioRecord otherwise). It needs RECORD_AUDIO granted when the service starts, which
      // the call flow asks for first. Remote messaging is the type the app already declares to Play.
      val type = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
        ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE or ServiceInfo.FOREGROUND_SERVICE_TYPE_REMOTE_MESSAGING
      } else {
        ServiceInfo.FOREGROUND_SERVICE_TYPE_MANIFEST
      }
      ServiceCompat.startForeground(this, NotificationBuilder.CALL_NOTIFICATION_ID, notification, type)
    } catch (e: Exception) {
      // The call itself carries on; only the notification and the background guarantee are lost. A
      // SecurityException here usually means RECORD_AUDIO was not granted yet.
      Log.w(TAG, "Unable to enter the foreground", e)
      stopSelf()
    }
    return START_NOT_STICKY
  }

  override fun onDestroy() {
    running = false
    super.onDestroy()
  }

  companion object {
    private const val TAG = "CallService"

    /** True while the service is alive in this process, so an update can skip the start request. */
    @Volatile
    var running = false
  }
}
