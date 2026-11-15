package com.tricordarr.push

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/**
 * Restarts the service after a reboot or an app update. Uses BOOT_COMPLETED rather than
 * LOCKED_BOOT_COMPLETED because Keystore-backed storage is only readable after first unlock.
 */
class PushBootReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    if (intent.action == Intent.ACTION_BOOT_COMPLETED || intent.action == Intent.ACTION_MY_PACKAGE_REPLACED) {
      PushServiceController.startIfConfigured(context)
    }
  }
}
