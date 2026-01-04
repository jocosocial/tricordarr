import React, {PropsWithChildren, useEffect, useState} from 'react';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {EnableUserNotificationContext} from '#src/Context/Contexts/EnableUserNotificationContext';
import {useOobe} from '#src/Context/Contexts/OobeContext';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {useSession} from '#src/Context/Contexts/SessionContext';

/**
 * "User Notifications" means both:
 * - Push notifications (from the platform-specific providers)
 * - NotificationSocket responses (purely on the JS side)
 */
export const EnableUserNotificationProvider = ({children}: PropsWithChildren) => {
  const [enableUserNotifications, setEnableUserNotifications] = useState<boolean | null>(null);
  const {isLoading, isLoggedIn} = useSession();
  const {appConfig} = useConfig();
  const {preRegistrationMode} = usePreRegistration();
  const {oobeCompleted} = useOobe();

  /**
   * Once the app has "started", figure out if we should enable the background worker.
   */
  useEffect(() => {
    if (isLoading) {
      console.log('[EnableUserNotificationProvider.tsx] App is still loading');
      return;
    }
    if (isLoggedIn && oobeCompleted && !preRegistrationMode) {
      console.log('[EnableUserNotificationProvider.tsx] User notifications can start.');
      console.log('[EnableUserNotificationProvider.tsx] Enabled is', appConfig.enableBackgroundWorker);
      setEnableUserNotifications(appConfig.enableBackgroundWorker);
    } else {
      console.log('[EnableUserNotificationProvider.tsx] Disabling user notifications');
      setEnableUserNotifications(false);
    }
  }, [isLoggedIn, isLoading, appConfig.enableBackgroundWorker, oobeCompleted, preRegistrationMode]);

  return (
    <EnableUserNotificationContext.Provider
      value={{
        enableUserNotifications,
        setEnableUserNotifications,
      }}>
      {children}
    </EnableUserNotificationContext.Provider>
  );
};
