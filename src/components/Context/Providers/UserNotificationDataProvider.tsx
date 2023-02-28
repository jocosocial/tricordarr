import React, {useCallback, useEffect, useState} from 'react';
import {UserNotificationDataContext} from '../Contexts/UserNotificationDataContext';
import {UserNotificationData} from '../../../libraries/./Structs/ControllerStructs';
import {DefaultProviderProps} from './ProviderTypes';
import {AppSettings} from '../../../libraries/AppSettings';
import {useQuery} from '@tanstack/react-query';
import {useUserData} from '../Contexts/UserDataContext';
import {startForegroundServiceWorker, stopForegroundServiceWorker} from '../../../libraries/Service';
import {getCurrentSSID} from '../../../libraries/Network/NetworkInfo';
import {useAppState} from '../Contexts/AppStateContext';
import {getSharedWebSocket} from '../../../libraries/Network/Websockets';
import {useErrorHandler} from '../Contexts/ErrorHandlerContext';
import {NotificationPoller} from '../../Libraries/Notifications/NotificationPoller';
import {ForegroundService} from '../../Libraries/Notifications/ForegroundService';

// https://www.carlrippon.com/typed-usestate-with-typescript/
// https://www.typescriptlang.org/docs/handbook/jsx.html
// Consider renaming to UserNotificationProvider?
export const UserNotificationDataProvider = ({children}: DefaultProviderProps) => {
  const [userNotificationData, setUserNotificationData] = useState({} as UserNotificationData);
  const {isLoggedIn, isLoading} = useUserData();
  const [enableUserNotifications, setEnableUserNotifications] = useState<boolean | null>(null);
  const {setErrorMessage} = useErrorHandler();

  const determineNotificationEnable = useCallback(async () => {
    const currentWifiSSID = await getCurrentSSID();
    const shipWifiSSID = await AppSettings.SHIP_SSID.getValue();
    const overrideWifi = (await AppSettings.OVERRIDE_WIFI_CHECK.getValue()) === 'true';
    if ((currentWifiSSID === shipWifiSSID || overrideWifi) && isLoggedIn) {
      setEnableUserNotifications(true);
    } else {
      setEnableUserNotifications(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    // If we're done loading, and you're logged in, do the fancy checks.
    // Otherwise, don't even bother trying to enable notifications.
    if (!isLoading && isLoggedIn) {
      determineNotificationEnable().catch(error => setErrorMessage(error.toString()));
    }
    // } else {
    //   setEnableUserNotifications(false);
    // }
  }, [isLoggedIn, isLoading, determineNotificationEnable, setErrorMessage]);

  return (
    <UserNotificationDataContext.Provider
      value={{
        userNotificationData,
        setUserNotificationData,
        enableUserNotifications,
        setEnableUserNotifications,
      }}>
      <NotificationPoller enable={enableUserNotifications} isLoading={isLoading} />
      <ForegroundService enable={enableUserNotifications} isLoading={isLoading} />
      {children}
    </UserNotificationDataContext.Provider>
  );
};
