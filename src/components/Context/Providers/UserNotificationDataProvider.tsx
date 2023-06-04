import React, {useCallback, useEffect, useState, PropsWithChildren, useReducer} from 'react';
import {UserNotificationDataContext} from '../Contexts/UserNotificationDataContext';
import {useErrorHandler} from '../Contexts/ErrorHandlerContext';
import {useNetInfo} from '@react-native-community/netinfo';
import {useAuth} from '../Contexts/AuthContext';
import {
  UserNotificationDataActions,
  userNotificationDataReducer,
} from '../../Reducers/Notification/UserNotificationDataReducer';
import {useUserNotificationDataQuery} from '../../Queries/Alert/NotificationQueries';
import {useConfig} from '../Contexts/ConfigContext';

// https://www.carlrippon.com/typed-usestate-with-typescript/
// https://www.typescriptlang.org/docs/handbook/jsx.html
// Consider renaming to UserNotificationProvider?
export const UserNotificationDataProvider = ({children}: PropsWithChildren) => {
  const [enableUserNotifications, setEnableUserNotifications] = useState<boolean | null>(null);
  const {setErrorMessage} = useErrorHandler();
  const netInfo = useNetInfo();
  const {isLoggedIn} = useAuth();
  const [userNotificationData, dispatchUserNotificationData] = useReducer(userNotificationDataReducer, undefined);
  // This is provided here for convenience.
  const {data, refetch: refetchUserNotificationData} = useUserNotificationDataQuery();
  const {appConfig} = useConfig();

  // @TODO this is gonna re-trigger every time netinfo changes. That's very bad.
  const determineNotificationEnable = useCallback(async () => {
    const currentWifiSSID = netInfo.type === 'wifi' && netInfo.details.ssid ? netInfo.details.ssid : 'ERR_NO_WIFI';
    if ((currentWifiSSID === appConfig.shipSSID || appConfig.overrideWifiCheck) && isLoggedIn) {
      setEnableUserNotifications(true);
    } else {
      setEnableUserNotifications(false);
      setErrorMessage('Twitarr notifications have been disabled.');
    }
  }, [netInfo, appConfig, isLoggedIn, setErrorMessage]);

  // @TODO something with the polling is triggering this.
  // It's the setUserNotificationData(data); from NotificationPoller.
  // But I killed that....
  useEffect(() => {
    // If we're done loading, and you're logged in, do the fancy checks.
    // Otherwise, don't even bother trying to enable notifications. Leave
    // it alone so that we don't force the value to change too much.
    if (isLoggedIn) {
      determineNotificationEnable().catch(error => setErrorMessage(error.toString()));
    }
  }, [isLoggedIn, determineNotificationEnable, setErrorMessage]);

  useEffect(() => {
    if (data) {
      console.log('Setting UND data in UNDProvider');
      dispatchUserNotificationData({
        type: UserNotificationDataActions.set,
        userNotificationData: data,
      });
    }
  }, [data]);

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
