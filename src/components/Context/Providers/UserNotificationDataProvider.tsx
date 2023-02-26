import React, {useEffect, useState} from 'react';
import {UserNotificationDataContext} from '../Contexts/UserNotificationDataContext';
import {UserNotificationData} from '../../../libraries/./Structs/ControllerStructs';
import {DefaultProviderProps} from './ProviderTypes';
import {AppSettings} from '../../../libraries/AppSettings';
import {useQuery} from '@tanstack/react-query';
import {useUserData} from '../Contexts/UserDataContext';
import {startForegroundServiceWorker, stopForegroundServiceWorker} from '../../../libraries/Service';
import {getCurrentSSID} from '../../../libraries/Network/NetworkInfo';

// https://www.carlrippon.com/typed-usestate-with-typescript/
// https://www.typescriptlang.org/docs/handbook/jsx.html
// Consider renaming to UserNotificationProvider?
export const UserNotificationDataProvider = ({children}: DefaultProviderProps) => {
  const [userNotificationData, setUserNotificationData] = useState({} as UserNotificationData);
  const {isLoggedIn} = useUserData();
  const [enableUserNotifications, setEnableUserNotifications] = useState(false);
  const [pollSetIntervalID, setPollSetIntervalID] = useState(0);

  const {data, refetch} = useQuery<UserNotificationData>({
    queryKey: ['/notification/global'],
    enabled: enableUserNotifications,
  });

  useEffect(() => {
    async function determineNotificationEnable() {
      const currentWifiSSID = await getCurrentSSID();
      const shipWifiSSID = await AppSettings.SHIP_SSID.getValue();
      // Add an override switch
      if (currentWifiSSID === shipWifiSSID && isLoggedIn) {
        console.debug('UserNotificationDataProvider enableUserNotifications');
        setEnableUserNotifications(true);
      } else {
        console.debug('UserNotificationDataProvider disableUserNotifications');
        setEnableUserNotifications(false);
      }
    }
    determineNotificationEnable().catch(console.error);
  }, [enableUserNotifications, isLoggedIn]);

  useEffect(() => {
    if (enableUserNotifications) {
      console.debug('UserNotificationDataProvider startFgs');
      startForegroundServiceWorker().catch(error => {
        console.error('Error starting FGS:', error);
      });
    } else {
      console.debug('UserNotificationDataProvider stopFgs');
      stopForegroundServiceWorker().catch(error => {
        console.error('Error stopping FGS:', error);
      });
      setUserNotificationData({} as UserNotificationData);
    }
  }, [enableUserNotifications]);

  useEffect(() => {
    console.log('UserNotificationDataProvider useEffect::data', data);
    if (data) {
      setUserNotificationData(data);
    }
  }, [data]);

  useEffect(() => {
    async function startPollInterval() {
      let pollInterval: number = Number((await AppSettings.NOTIFICATION_POLL_INTERVAL.getValue()) ?? '5000');
      return setInterval(() => {
        refetch();
      }, pollInterval);
    }
    if (enableUserNotifications) {
      console.log('enable');
      if (pollSetIntervalID === 0) {
        startPollInterval()
          .then(setPollSetIntervalID)
          .finally(() => refetch());
      }
    } else {
      console.log('disable');
      clearInterval(pollSetIntervalID);
      setPollSetIntervalID(0);
    }
    // This clears when the component unmounts.
    return () => {
      clearInterval(pollSetIntervalID);
      console.log('Cleared setInterval with ID', pollSetIntervalID);
    };
  }, [enableUserNotifications, pollSetIntervalID, refetch]);

  return (
    <UserNotificationDataContext.Provider
      value={{userNotificationData, setUserNotificationData, enableUserNotifications, setEnableUserNotifications}}>
      {children}
    </UserNotificationDataContext.Provider>
  );
};
