import {checkNotifications, RESULTS} from 'react-native-permissions';

import {flushSessionWrites} from '#src/Context/State/SessionStore';
import {createLogger} from '#src/Libraries/Logger';
import {buildPushAccounts} from '#src/Libraries/Notifications/Push/PushAccounts';

import NativeTricordarrModule from '#specs/NativeTricordarrModule';

const logger = createLogger('Push');

/**
 * Make the native background notification provider match the account model: hand it every
 * account that should have a socket, and start it, or stop it when there are none. Each platform
 * runs one provider holding one socket per account (Android's TwitarrPushService, iOS's local push
 * extension and its in-app stand-in). It is device-wide and keyed by account, so this runs on app
 * launch and after anything that changes the accounts, the active one, their tokens or their push
 * preferences, and is safe to call again: only sockets whose server or token changed are reopened.
 */
export const startPushProvider = async () => {
  // The accounts are read from storage (LAST_SESSION_ID picks the active one); let a just-dispatched switch land first.
  await flushSessionWrites();
  const {status: notificationPermission} = await checkNotifications();
  // Android 13 API Level 33 added POST_NOTIFICATIONS permission. Devices less than that return UNAVAILABLE.
  // We can safely assume that notifications are allowed and available if that is the case.
  if (notificationPermission !== RESULTS.UNAVAILABLE && notificationPermission !== RESULTS.GRANTED) {
    logger.debug('Notification permission not allowed. Stopping the push provider.');
    await stopPushProvider();
    return;
  }
  const accounts = await buildPushAccounts();
  logger.debug('Syncing push accounts with the native push provider:', accounts.length);
  NativeTricordarrModule.syncPushAccounts(JSON.stringify(accounts));
  if (accounts.length > 0) {
    NativeTricordarrModule.startBackgroundService();
  } else {
    NativeTricordarrModule.stopBackgroundService();
  }
};

/**
 * Turn background notifications off for every account on the device and have native forget the
 * accounts, which also drops its copies of their tokens.
 */
export const stopPushProvider = async () => {
  logger.debug('Stopping the native push provider.');
  NativeTricordarrModule.syncPushAccounts('[]');
  NativeTricordarrModule.stopBackgroundService();
};
