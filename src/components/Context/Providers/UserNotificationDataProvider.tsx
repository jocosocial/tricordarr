import React, {useCallback, useEffect, useState} from 'react';
import {UserNotificationDataContext} from '../Contexts/UserNotificationDataContext';
import {UserNotificationData} from '../../../libraries/Structs/ControllerStructs';
import {DefaultProviderProps} from './ProviderTypes';
import {AppSettings} from '../../../libraries/AppSettings';
import {useUserData} from '../Contexts/UserDataContext';
import {useErrorHandler} from '../Contexts/ErrorHandlerContext';
import {useNetInfo} from '@react-native-community/netinfo';

// https://www.carlrippon.com/typed-usestate-with-typescript/
// https://www.typescriptlang.org/docs/handbook/jsx.html
// Consider renaming to UserNotificationProvider?
export const UserNotificationDataProvider = ({children}: DefaultProviderProps) => {
  const [userNotificationData, setUserNotificationData] = useState({} as UserNotificationData);
  const {isLoggedIn, isLoading} = useUserData();
  const [enableUserNotifications, setEnableUserNotifications] = useState<boolean | null>(null);
  const {setErrorMessage} = useErrorHandler();
  const netInfo = useNetInfo();

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
  useEffect(() => {
    // If we're done loading, and you're logged in, do the fancy checks.
    // Otherwise, don't even bother trying to enable notifications. Leave
    // it alone so that we don't force the value to change too much.
    if (!isLoading && isLoggedIn) {
      determineNotificationEnable().catch(error => setErrorMessage(error.toString()));
    }
  }, [isLoggedIn, isLoading, determineNotificationEnable, setErrorMessage]);

  return (
    <UserNotificationDataContext.Provider
      value={{
        userNotificationData,
        setUserNotificationData,
        enableUserNotifications,
        setEnableUserNotifications,
      }}>
      {children}
    </UserNotificationDataContext.Provider>
  );
};
