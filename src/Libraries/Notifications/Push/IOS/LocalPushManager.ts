import {checkNotifications, RESULTS} from 'react-native-permissions';

import {getAppConfig} from '#src/Libraries/AppConfig';
import {buildWebsocketURL, getToken} from '#src/Libraries/Network/Websockets';

import NativeTricordarrModule from '#specs/NativeTricordarrModule';

/**
 * Start the iOS Local Push Manager and Websocket notifier. See `NativeTricordarrModule` on
 * the Native side for implementation details.
 */

export const startLocalPushManager = async () => {
  const {status: notificationPermission} = await checkNotifications();
  // Android 13 API Level 33 added POST_NOTIFICATIONS permission. Devices less than that return UNAVAILABLE.
  // We can safely assume that notifications are allowed and available if that is the case.
  if (notificationPermission !== RESULTS.UNAVAILABLE && notificationPermission !== RESULTS.GRANTED) {
    console.log('[Service.ts] Notification permission not allowed. Not starting manager.');
    return;
  }
  const [socketUrl, token, appConfig] = await Promise.all([buildWebsocketURL(), getToken(), getAppConfig()]);
  if (!socketUrl || !token) {
    console.error('[Service.ts] Failed to get socket URL or token. Not starting manager.');
    return;
  }
  console.log('[Service.ts] Starting local push manager.');
  NativeTricordarrModule.setupLocalPushManager(socketUrl, token, appConfig.enableNotificationSocket);
}; /**
 * Stop the iOS Local Push Manager and Websocket notifier. See `NativeTricordarrModule` on
 * the Native side for implementation details.
 */

export const stopLocalPushManager = async () => {
  const [socketUrl, token] = await Promise.all([buildWebsocketURL(), getToken()]);
  if (!socketUrl || !token) {
    console.error('[Service.ts] Failed to get socket URL or token. Cant stop manager.');
    return;
  }
  console.log('[Service.ts] Stopping local push manager.');
  // @TODO should we make a dedicated stop function?
  NativeTricordarrModule.setupLocalPushManager(socketUrl, token, false);
};

/**
 * Clear all stored notification settings and stop all providers.
 * Provides a clean slate by clearing stored socket URL, token, disabling the background push manager,
 * and stopping/clearing the foreground push provider.
 */
export const clearLocalPushManager = () => {
  console.log('[LocalPushManager.ts] Clearing local push manager.');
  NativeTricordarrModule.clearLocalPushManager();
};
