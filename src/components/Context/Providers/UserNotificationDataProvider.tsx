import React, {useCallback, useEffect, useState, PropsWithChildren, useReducer} from 'react';
import {UserNotificationDataContext} from '../Contexts/UserNotificationDataContext';
import {AppSettings} from '../../../libraries/AppSettings';
import {useErrorHandler} from '../Contexts/ErrorHandlerContext';
import {useNetInfo} from '@react-native-community/netinfo';
import {useAuth} from '../Contexts/AuthContext';
import {userNotificationDataReducer} from '../../Reducers/Notification/UserNotificationDataReducer';
import {useUserNotificationDataQuery} from '../../Queries/Alert/NotificationQueries';

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
  const {refetch: refetchUserNotificationData} = useUserNotificationDataQuery();

  const determineNotificationEnable = useCallback(async () => {
    const currentWifiSSID = netInfo.type === 'wifi' && netInfo.details.ssid ? netInfo.details.ssid : 'ERR_NO_WIFI';
    const shipWifiSSID = await AppSettings.SHIP_SSID.getValue();
    const overrideWifi = (await AppSettings.OVERRIDE_WIFI_CHECK.getValue()) === 'true';
    if ((currentWifiSSID === shipWifiSSID || overrideWifi) && isLoggedIn) {
      setEnableUserNotifications(true);
    } else {
      setEnableUserNotifications(false);
      setErrorMessage('Twitarr notifications have been disabled.');
    }
  }, [setErrorMessage, isLoggedIn, netInfo.type, netInfo.details]);

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
