import {useEffect} from 'react';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useEnableUserNotification} from '#src/Context/Contexts/EnableUserNotificationContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {createLogger} from '#src/Libraries/Logger';
import {startPushProvider, stopPushProvider} from '#src/Libraries/Notifications/Push';
import {isAndroid} from '#src/Libraries/Platform/Detection';

const logger = createLogger('PushNotificationService.tsx');

/**
 * Functional component to control the lifecycle of the platform-dependent push notification
 * system.
 *
 * iOS uses a combination of a background `NEAppPushManager` and a websocket listener to generate
 * notifications purely on the native side, for the active account only.
 *
 * Android uses a native Kotlin foreground service (TwitarrPushService) that owns one socket per
 * account and posts notifications itself. It serves the active account plus any other account
 * that opted in to background notifications, so it is not tied to the active session: JS only
 * re-syncs the account list whenever something that feeds it changes.
 */
export const PushNotificationService = () => {
  const {enableUserNotifications} = useEnableUserNotification();
  const {isLoading, isLoggedIn, accounts, currentSession, currentToken} = useSession();
  const {appConfig} = useConfig();
  // Signing out or removing an account that is not the active one remounts nothing, so watch the list.
  const accountsKey = accounts.map(account => `${account.accountID}:${account.status}`).join(',');

  useEffect(() => {
    if (isAndroid) {
      return;
    }
    logger.debug('isLoggedIn', isLoggedIn, 'enableUserNotifications', enableUserNotifications);
    if (isLoading || enableUserNotifications === null) {
      logger.debug('Conditions for push notifications not met. Not starting.');
      return;
    }

    // enableUserNotifications already factors in oobeCompleted, isLoggedIn, and preRegistrationMode.
    if (enableUserNotifications) {
      startPushProvider();
    } else {
      stopPushProvider();
    }
  }, [enableUserNotifications, isLoggedIn, isLoading]);

  // The native service decides from its own copy of the accounts and their preferences, so push
  // every change to it. It works out from storage which accounts to serve (and stops itself when
  // there are none), which is why this also runs while the active session cannot be notified.
  useEffect(() => {
    if (!isAndroid || isLoading || enableUserNotifications === null) {
      return;
    }
    startPushProvider().catch(error => logger.error('Failed to sync the push service', error));
  }, [
    isLoading,
    enableUserNotifications,
    accountsKey,
    currentSession?.sessionID,
    currentToken?.token,
    appConfig.pushNotifications,
    appConfig.muteNotifications,
    appConfig.backgroundNotifications,
    appConfig.urlPrefix,
    appConfig.enableNotificationSocket,
    appConfig.enableBackgroundWorker,
  ]);

  return null;
};
