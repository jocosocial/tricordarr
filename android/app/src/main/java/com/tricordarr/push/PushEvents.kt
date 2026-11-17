package com.tricordarr.push

/**
 * Bridge from the push service, which runs without a React context, to the TurboModule that
 * emits events to JS. The module registers itself while it is alive; events fired with no
 * listener are dropped, which is fine because native is the source of truth and JS pulls
 * status and the log when it starts or foregrounds.
 */
object PushEvents {
  interface Listener {
    fun onNotificationSocketEvent(accountID: String, raw: String)

    fun onBackgroundStatusChanged(status: AccountStatus)

    fun onMarkAsRead(accountID: String, contentID: String)
  }

  @Volatile
  var listener: Listener? = null
}
