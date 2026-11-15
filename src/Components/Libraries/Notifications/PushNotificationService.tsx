import {useEffect} from 'react';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useEnableUserNotification} from '#src/Context/Contexts/EnableUserNotificationContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {createLogger} from '#src/Libraries/Logger';
import {startPushProvider} from '#src/Libraries/Notifications/Push';

const logger = createLogger('PushNotificationService.tsx');

/**
 * Functional component to keep the platform-dependent push notification system in step with the
 * account model.
 *
 * Both platforms run one native provider that owns a notification socket per account and posts
 * notifications itself: Android a Kotlin foreground service (TwitarrPushService), iOS a background
 * `NEAppPushManager` extension with an in-app stand-in. It serves the active account plus any
 * other account that opted in to background notifications, so it is not tied to the active
 * session: JS only re-syncs the account list whenever something that feeds it changes.
 */
export const PushNotificationService = () => {
  const {enableUserNotifications} = useEnableUserNotification();
  const {isLoading, accounts, currentSession, currentToken} = useSession();
  const {appConfig} = useConfig();
  // Signing out or removing an account that is not the active one remounts nothing, so watch the list.
  const accountsKey = accounts.map(account => `${account.accountID}:${account.status}`).join(',');
  const wifiNetworksKey = appConfig.wifiNetworkNames.join(',');

  // The native provider decides from its own copy of the accounts and their preferences, so push
  // every change to it. It works out from storage which accounts to serve (and stops when there
  // are none), which is why this also runs while the active session cannot be notified.
  useEffect(() => {
    if (isLoading || enableUserNotifications === null) {
      logger.debug('Conditions for push notifications not met. Not syncing.');
      return;
    }
    startPushProvider().catch(error => logger.error('Failed to sync the push provider', error));
  }, [
    isLoading,
    enableUserNotifications,
    accountsKey,
    wifiNetworksKey,
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
