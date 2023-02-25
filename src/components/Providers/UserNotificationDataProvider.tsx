import React, {useEffect, useState} from 'react';
import {UserNotificationDataContext} from '../Contexts/UserNotificationDataContext';
import {UserNotificationData} from '../../libraries/structs/ControllerStructs';
import {DefaultProviderProps} from './ProviderTypes';
import {AppSettings} from "../../libraries/AppSettings";
import {useQuery} from "@tanstack/react-query";
import {useUserData} from "../Contexts/UserDataContext";
import {startForegroundServiceWorker, stopForegroundServiceWorker} from "../../libraries/Service";

// https://www.carlrippon.com/typed-usestate-with-typescript/
// https://www.typescriptlang.org/docs/handbook/jsx.html
// Consider renaming to UserNotificationProvider?
export const UserNotificationDataProvider = ({children}: DefaultProviderProps) => {
  const [userNotificationData, setUserNotificationData] = useState({} as UserNotificationData);
  const {isLoggedIn} = useUserData();

  useEffect(() => {
    if (isLoggedIn) {
      console.debug('YOU ARE LOGGED IN! Starting FGS.');
      startForegroundServiceWorker().catch(error => {
        console.error('Error starting FGS:', error);
      });
    } else {
      console.debug('YOU ARE NOT LOGGED IN! Stopping FGS.');
      stopForegroundServiceWorker().catch(error => {
        console.error('Error stopping FGS:', error);
      });
    }
  }, [isLoggedIn]);
  // Disabling this feature until I come back to it.
  // const {error, data, refetch} = useQuery<UserNotificationData>({
  //   queryKey: ['/notification/global'],
  // });

  // useEffect(() => {
  //   console.log('TODO this is where I should check if poll is enabled');
  //   async function getTimerInterval() {
  //     let pollInterval: string | null = await AppSettings.NOTIFICATION_POLL_INTERVAL.getValue();
  //     if (!pollInterval) {
  //       pollInterval = '300000';
  //     }
  //     return Number(pollInterval);
  //   }
  //
  //   const refreshInterval = getTimerInterval().then(timeout => {
  //     return setInterval(() => {
  //       console.log('Refreshing notification data...');
  //       refetch();
  //       if (data) {
  //         setUserNotificationData(data);
  //         console.log('Stored new data.');
  //       }
  //     }, timeout);
  //   });
  //   // This is returning every run and I don't like it. It at least stops when the
  //   // app gets backgrounded so the result is desired.
  //   return () => {
  //     console.log('Stopping UserNotificationDataProvider.');
  //     refreshInterval.then(clearInterval);
  //   };
  // }, [data, refetch]);

  return (
    <UserNotificationDataContext.Provider value={{userNotificationData, setUserNotificationData}}>
      {children}
    </UserNotificationDataContext.Provider>
  );
};
