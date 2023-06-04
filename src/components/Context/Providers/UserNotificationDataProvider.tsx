import React, {useCallback, useEffect, useState, PropsWithChildren, useReducer} from 'react';
import {UserNotificationDataContext} from '../Contexts/UserNotificationDataContext';
import {AppSettings} from '../../../libraries/AppSettings';
import {useErrorHandler} from '../Contexts/ErrorHandlerContext';
import {useNetInfo} from '@react-native-community/netinfo';
import {useAuth} from '../Contexts/AuthContext';
import {
  UserNotificationDataActions,
  userNotificationDataReducer
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

  const determineNotificationEnable = useCallback(async () => {
    const currentWifiSSID = netInfo.type === 'wifi' && netInfo.details.ssid ? netInfo.details.ssid : 'ERR_NO_WIFI';
    const overrideWifi = (await AppSettings.OVERRIDE_WIFI_CHECK.getValue()) === 'true';
    if ((currentWifiSSID === appConfig.shipSSID || overrideWifi) && isLoggedIn) {
      setEnableUserNotifications(true);
    } else {
      setEnableUserNotifications(false);
      setErrorMessage('Twitarr notifications have been disabled.');
    }
  }, [netInfo.type, netInfo.details.ssid, appConfig.shipSSID, isLoggedIn, setErrorMessage]);

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
