import {checkNotifications, RESULTS} from 'react-native-permissions';

import {createLogger} from '#src/Libraries/Logger';
import {buildPushAccounts} from '#src/Libraries/Notifications/Push/PushAccounts';

import NativeTricordarrModule from '#specs/NativeTricordarrModule';

const logger = createLogger('PushService.ts');

/**
 * Hand the current account list to the native Android push service. The service reads it from its
 * own encrypted store, so this must run on sign-in/out/switch and whenever the push preferences
 * change. Safe to call while the service is running; it reconciles itself.
 */
export const syncAndroidPushAccounts = async () => {
  NativeTricordarrModule.syncPushAccounts(JSON.stringify(await buildPushAccounts()));
};

/**
 * Start the native Android foreground service that owns the notification socket and posts
 * notifications. Called on every app launch, so it must be cheap when the service is already
 * running (native just reconciles).
 */
export async function startAndroidPushService() {
  const {status: notificationPermission} = await checkNotifications();
  // Android 13 API Level 33 added POST_NOTIFICATIONS permission. Devices less than that return UNAVAILABLE.
  // We can safely assume that notifications are allowed and available if that is the case.
  if (notificationPermission !== RESULTS.UNAVAILABLE && notificationPermission !== RESULTS.GRANTED) {
    logger.debug('Notification permission not allowed. Not starting the push service.');
    return;
  }
  await syncAndroidPushAccounts();
  logger.debug('Starting native push service.');
  NativeTricordarrModule.startBackgroundService();
}

/**
 * Stop the native Android push service and forget the accounts, which also drops the stored token.
 */
export async function stopAndroidPushService() {
  logger.debug('Stopping native push service.');
  NativeTricordarrModule.syncPushAccounts('[]');
  NativeTricordarrModule.stopBackgroundService();
}
