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

// https://www.carlrippon.com/typed-usestate-with-typescript/
// https://www.typescriptlang.org/docs/handbook/jsx.html
// Consider renaming to UserNotificationProvider?
export const UserNotificationDataProvider = ({children}: DefaultProviderProps) => {
  const [userNotificationData, setUserNotificationData] = useState({} as UserNotificationData);
  const {isLoggedIn} = useUserData();
  const [enableUserNotifications, setEnableUserNotifications] = useState(false);
  const [pollSetIntervalID, setPollSetIntervalID] = useState(0);
  const {appStateVisible} = useAppState();

  // const {data, refetch} = useQuery<UserNotificationData>({
  //   queryKey: ['/notification/global'],
  //   enabled: enableUserNotifications,
  // });
  //
  // const controlFgs = useCallback((enable: boolean) => {
  //   if (enable) {
  //     console.log('UserNotificationDataProvider startFgs');
  //     startForegroundServiceWorker().catch(error => {
  //       console.error('Error starting FGS:', error);
  //     });
  //   } else {
  //     console.log('UserNotificationDataProvider stopFgs');
  //     stopForegroundServiceWorker().catch(error => {
  //       console.error('Error stopping FGS:', error);
  //     });
  //     setUserNotificationData({} as UserNotificationData);
  //   }
  // }, []);
  //
  // const determineNotificationEnable = useCallback(async () => {
  //   const currentWifiSSID = await getCurrentSSID();
  //   const shipWifiSSID = await AppSettings.SHIP_SSID.getValue();
  //   const overrideWifi = (await AppSettings.OVERRIDE_WIFI_CHECK.getValue()) === 'true';
  //   if ((currentWifiSSID === shipWifiSSID || overrideWifi) && isLoggedIn) {
  //     console.log('UserNotificationDataProvider enableUserNotifications');
  //     await setEnableUserNotifications(true);
  //     controlFgs(true);
  //   } else {
  //     console.log('UserNotificationDataProvider disableUserNotifications');
  //     await setEnableUserNotifications(false);
  //     controlFgs(false);
  //   }
  // }, [controlFgs, isLoggedIn]);
  //
  // useEffect(() => {
  //   console.debug('UserNotificationDataProvider :: isLoggedIn');
  //   // isLoggedIn from UserDataProvider initializes as undefined because
  //   // we determine that based on whether a token has been set in settings.
  //   // This caused the FGS to be reloaded twice in quick succession because
  //   // the first render of components would always be false/disabled.
  //   if (isLoggedIn !== undefined) {
  //     determineNotificationEnable().catch(console.error);
  //   }
  // }, [isLoggedIn, determineNotificationEnable]);
  //
  // useEffect(() => {
  //   console.debug('UserNotificationDataProvider :: data');
  //   if (data) {
  //     setUserNotificationData(data);
  //   }
  // }, [data]);
  //
  // // We can call refetch aggressively because we can cache the result for a while
  // // and avoid hitting the server for new data.
  // useEffect(() => {
  //   console.debug('UserNotificationDataProvider :: thebigone');
  //   async function unmountProvider() {
  //     let ws = await getSharedWebSocket();
  //     // if (ws && ws.readyState === WebSocket.OPEN) {
  //     if (ws) {
  //       ws.removeEventListener('message', () => refetch());
  //     }
  //     clearInterval(pollSetIntervalID);
  //     console.log('Cleared setInterval with ID', pollSetIntervalID);
  //   }
  //   async function startWsListener() {
  //     console.log('Considering attaching websocket listener');
  //     let ws = await getSharedWebSocket();
  //     // if (ws && ws.readyState === WebSocket.OPEN) {
  //     if (ws) {
  //       console.log('Attaching listener to socket.');
  //       ws.addEventListener('message', () => refetch());
  //     } else {
  //       console.log('Skipping attaching to socket', ws);
  //     }
  //     console.log('finished attaching or not');
  //   }
  //   async function startPollInterval() {
  //     let pollInterval: number = Number((await AppSettings.NOTIFICATION_POLL_INTERVAL.getValue()) ?? '5000');
  //     return setInterval(() => {
  //       refetch();
  //     }, pollInterval);
  //   }
  //   if (enableUserNotifications && appStateVisible === 'active') {
  //     if (pollSetIntervalID === 0) {
  //       startPollInterval()
  //         .then(setPollSetIntervalID)
  //         .finally(() => refetch());
  //       startWsListener().catch(error => {
  //         console.error('Error startWsListener', error);
  //       });
  //     }
  //   } else {
  //     clearInterval(pollSetIntervalID);
  //     setPollSetIntervalID(0);
  //   }
  //   return () => {
  //     unmountProvider()
  //       .then(() => {
  //         console.log('UserNotificationDataProvider unmounted');
  //       })
  //       .catch(error => {
  //         console.error('UserNotificationDataProvider cleanup failed', error);
  //       });
  //   };
  // }, [enableUserNotifications, pollSetIntervalID, refetch, appStateVisible]);

  return (
    <UserNotificationDataContext.Provider
      value={{
        userNotificationData,
        setUserNotificationData,
        enableUserNotifications,
        setEnableUserNotifications,
        // refetch,
      }}>
      {children}
    </UserNotificationDataContext.Provider>
  );
};
