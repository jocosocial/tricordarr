import {checkNotifications, RESULTS} from 'react-native-permissions';

import {createLogger} from '#src/Libraries/Logger';
import {buildPushAccounts} from '#src/Libraries/Notifications/Push/PushAccounts';

import NativeTricordarrModule from '#specs/NativeTricordarrModule';

const logger = createLogger('PushService.ts');

/**
 * Make the native Android push service match the account model: hand it every account that
 * should have a background socket, then start it, or stop it when there are none. The service is
 * device-wide and keyed by account, so this runs on app launch and after anything that changes
 * the accounts, the active one, their tokens or their push preferences. A running service only
 * reopens the sockets whose server or token changed.
 */
export async function syncAndroidPushService() {
  const {status: notificationPermission} = await checkNotifications();
  // Android 13 API Level 33 added POST_NOTIFICATIONS permission. Devices less than that return UNAVAILABLE.
  // We can safely assume that notifications are allowed and available if that is the case.
  if (notificationPermission !== RESULTS.UNAVAILABLE && notificationPermission !== RESULTS.GRANTED) {
    logger.debug('Notification permission not allowed. Stopping the push service.');
    await stopAndroidPushService();
    return;
  }
  const accounts = await buildPushAccounts();
  logger.debug('Syncing push accounts with the native push service:', accounts.length);
  NativeTricordarrModule.syncPushAccounts(JSON.stringify(accounts));
  if (accounts.length > 0) {
    NativeTricordarrModule.startBackgroundService();
  } else {
    NativeTricordarrModule.stopBackgroundService();
  }
}

/**
 * Stop the native Android push service for every account and forget them, which also drops the
 * stored tokens.
 */
export async function stopAndroidPushService() {
  logger.debug('Stopping native push service.');
  NativeTricordarrModule.syncPushAccounts('[]');
  NativeTricordarrModule.stopBackgroundService();
}
