import React, {useEffect, useState, PropsWithChildren, useReducer} from 'react';
import {UserNotificationDataContext} from '../Contexts/UserNotificationDataContext';
import {useErrorHandler} from '../Contexts/ErrorHandlerContext';
import {useAuth} from '../Contexts/AuthContext';
import {
  UserNotificationDataActions,
  userNotificationDataReducer,
} from '../../Reducers/Notification/UserNotificationDataReducer';
import {useUserNotificationDataQuery} from '../../Queries/Alert/NotificationQueries';
import {useCruise} from '../Contexts/CruiseContext';

// https://www.carlrippon.com/typed-usestate-with-typescript/
// https://www.typescriptlang.org/docs/handbook/jsx.html
export const UserNotificationDataProvider = ({children}: PropsWithChildren) => {
  const [enableUserNotifications, setEnableUserNotifications] = useState<boolean | null>(null);
  const {setErrorMessage} = useErrorHandler();
  const {isLoading, isLoggedIn} = useAuth();
  const [userNotificationData, dispatchUserNotificationData] = useReducer(userNotificationDataReducer, undefined);
  // This is provided here for convenience.
  const {data, refetch: refetchUserNotificationData} = useUserNotificationDataQuery();
  const {hourlyUpdatingDate} = useCruise();

  /**
   * Once the app has "started", figure out if we should enable the background worker.
   */
  useEffect(() => {
    if (isLoading) {
      console.log('[UserNotificationDataProvider.tsx] App is still loading');
      return;
    }
    if (isLoggedIn) {
      console.log('[UserNotificationDataProvider.tsx] Enabling user notifications');
      setEnableUserNotifications(true);
    } else {
      console.log('[UserNotificationDataProvider.tsx] Disabling user notifications');
      setEnableUserNotifications(false);
      setErrorMessage('Twitarr notifications have been disabled.');
    }
  }, [isLoggedIn, setErrorMessage, isLoading]);

  /**
   * Fetch the UserNotificationData and whenever it changes update the global state.
   */
  useEffect(() => {
    if (data) {
      console.log('[UserNotificationDataProvider.tsx] Dispatch set UserNotificationData');
      dispatchUserNotificationData({
        type: UserNotificationDataActions.set,
        userNotificationData: data,
      });
    }
  }, [data]);

  /**
   * Every hour on the hour trigger the refresh. In addition to refreshing the users notification
   * data this also brings along a new server timestamp which is used in certain components.
   */
  useEffect(() => {
    refetchUserNotificationData().then(() =>
      console.log('[UserNotificationDataProvider.tsx] Refreshed UserNotificationData'),
    );
  }, [refetchUserNotificationData, hourlyUpdatingDate]);

  return (
    <UserNotificationDataContext.Provider
      value={{
        userNotificationData,
        dispatchUserNotificationData,
        enableUserNotifications,
        setEnableUserNotifications,
        refetchUserNotificationData,
      }}>
      {children}
    </UserNotificationDataContext.Provider>
  );
};
