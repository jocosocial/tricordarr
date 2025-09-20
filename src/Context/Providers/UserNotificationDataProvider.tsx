import React, {PropsWithChildren, useEffect, useState} from 'react';

import {useAuth} from '#src/Context/Contexts/AuthContext';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {UserNotificationDataContext} from '#src/Context/Contexts/UserNotificationDataContext';

// https://www.carlrippon.com/typed-usestate-with-typescript/
// https://www.typescriptlang.org/docs/handbook/jsx.html
export const UserNotificationDataProvider = ({children}: PropsWithChildren) => {
  const [enableUserNotifications, setEnableUserNotifications] = useState<boolean | null>(null);
  const {isLoading, isLoggedIn} = useAuth();
  // const [userNotificationData, dispatchUserNotificationData] = useReducer(userNotificationDataReducer, undefined);
  // This is provided here for convenience.
  // For some reason this fires twice on startup. The prior data is read from the cache then fetched twice.
  // const {data, refetch: refetchUserNotificationData} = useUserNotificationDataQuery();
  const {appConfig} = useConfig();
  const oobeCompleted = appConfig.oobeCompletedVersion === appConfig.oobeExpectedVersion;

  /**
   * Once the app has "started", figure out if we should enable the background worker.
   */
  useEffect(() => {
    if (isLoading) {
      console.log('[UserNotificationDataProvider.tsx] App is still loading');
      return;
    }
    if (isLoggedIn && oobeCompleted) {
      console.log('[UserNotificationDataProvider.tsx] User notifications can start.');
      console.log('[UserNotificationDataProvider.tsx] Enabled is', appConfig.enableBackgroundWorker);
      setEnableUserNotifications(appConfig.enableBackgroundWorker);
    } else {
      console.log('[UserNotificationDataProvider.tsx] Disabling user notifications');
      setEnableUserNotifications(false);
    }
  }, [isLoggedIn, isLoading, appConfig.enableBackgroundWorker, oobeCompleted]);

  /**
   * Fetch the UserNotificationData and whenever it changes update the global state.
   */
  // useEffect(() => {
  //   if (data) {
  //     console.log('[UserNotificationDataProvider.tsx] Dispatch set UserNotificationData');
  //     dispatchUserNotificationData({
  //       type: UserNotificationDataActions.set,
  //       userNotificationData: data,
  //     });
  //   }
  // }, [data]);

  return (
    <UserNotificationDataContext.Provider
      value={{
        // userNotificationData,
        // dispatchUserNotificationData,
        enableUserNotifications,
        setEnableUserNotifications,
        // refetchUserNotificationData,
      }}>
      {children}
    </UserNotificationDataContext.Provider>
  );
};
