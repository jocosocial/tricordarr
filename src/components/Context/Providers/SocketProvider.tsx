import React, {useState, PropsWithChildren, useCallback, useEffect} from 'react';
import {SocketContext} from '../Contexts/SocketContext';
import {buildWebSocket} from '../../../libraries/Network/Websockets';
import ReconnectingWebSocket from 'reconnecting-websocket';
import {useConfig} from '../Contexts/ConfigContext';
import {useAuth} from '../Contexts/AuthContext';

export const SocketProvider = ({children}: PropsWithChildren) => {
  const {isLoggedIn} = useAuth();
  const [notificationSocket, setNotificationSocket] = useState<ReconnectingWebSocket>();
  const [fezSocket, setFezSocket] = useState<ReconnectingWebSocket>();
  const {appConfig} = useConfig();
  const oobeCompleted = appConfig.oobeCompletedVersion === appConfig.oobeExpectedVersion;

  // Socket Open

  const openFezSocket = useCallback(
    (fezID: string) => {
      if (!appConfig.enableFezSocket) {
        console.log('[SocketProvider.tsx] FezSocket is disabled. Skipping open.');
        return;
      }
      console.log(`[SocketProvider.tsx] FezSocket enabled for ${fezID}. State: ${fezSocket?.readyState}`);
      if (fezSocket && (fezSocket.readyState === WebSocket.OPEN || fezSocket.readyState === WebSocket.CONNECTING)) {
        console.log('[SocketProvider.tsx] FezSocket already exists. Skipping buildWebSocket.');
      } else {
        buildWebSocket(fezID).then(ws => setFezSocket(ws));
      }
      console.log(`[SocketProvider.tsx] FezSocket open complete! State: ${fezSocket?.readyState}`);
    },
    [appConfig.enableFezSocket, fezSocket],
  );

  const openNotificationSocket = useCallback(() => {
    if (!appConfig.enableNotificationSocket) {
      console.log('[SocketProvider.tsx] NotificationSocket is disabled. Skipping open.');
      return;
    }
    console.log(`[SocketProvider.tsx] NotificationSocket enabled. State: ${notificationSocket?.readyState}`);
    if (
      notificationSocket &&
      (notificationSocket.readyState === WebSocket.OPEN || notificationSocket.readyState === WebSocket.CONNECTING)
    ) {
      console.log('[SocketProvider.tsx] NotificationSocket already exists. Skipping buildWebSocket.');
    } else {
      buildWebSocket().then(ws => setNotificationSocket(ws));
    }
    console.log(`[SocketProvider.tsx] NotificationSocket open complete! State: ${notificationSocket?.readyState}`);
  }, [appConfig.enableNotificationSocket, notificationSocket]);

  // Socket Close

  const closeFezSocket = useCallback(() => {
    console.log('[SocketProvider.tsx] FezSocket is closing.');
    if (fezSocket && (fezSocket.readyState === WebSocket.OPEN || fezSocket.readyState === WebSocket.CLOSED)) {
      fezSocket.close();
      setFezSocket(undefined);
    } else {
      console.log(`[SocketProvider.tsx] FezSocket ineligible for close. State: ${fezSocket?.readyState}`);
    }
    console.log(`[SocketProvider.tsx] FezSocket close complete. State: ${fezSocket?.readyState}`);
  }, [fezSocket]);

  const closeNotificationSocket = useCallback(() => {
    console.log('[SocketProvider.tsx] NotificationSocket is closing.');
    if (
      notificationSocket &&
      (notificationSocket.readyState === WebSocket.OPEN || notificationSocket.readyState === WebSocket.CLOSED)
    ) {
      notificationSocket.close();
      setNotificationSocket(undefined);
    } else {
      console.log(
        `[SocketProvider.tsx] NotificationSocket ineligible for close. State: ${notificationSocket?.readyState}`,
      );
    }
    console.log(`[SocketProvider.tsx] NotificationSocket close complete. State: ${notificationSocket?.readyState}`);
  }, [notificationSocket]);

  // Effects

  useEffect(() => {
    console.log('[SocketProvider.tsx] Triggering openNotificationSocket useEffect.');
    if (isLoggedIn && oobeCompleted) {
      openNotificationSocket();
    }
    console.log('[SocketProvider.tsx] Finished openNotificationSocket useEffect.');
  }, [openNotificationSocket, isLoggedIn, oobeCompleted]);

  useEffect(() => {
    console.log('[SocketProvider.tsx] Triggering socket close useEffect.');
    if (!appConfig.enableNotificationSocket) {
      console.log('[SocketProvider.tsx] NotificationSocket is disabled. Explicitly closing.');
      closeNotificationSocket();
    }
    if (!appConfig.enableFezSocket) {
      console.log('[SocketProvider.tsx] FezSocket is disabled. Explicitly closing.');
      closeFezSocket();
    }
    console.log('[SocketProvider.tsx] Finished socket close useEffect.');
  }, [appConfig.enableFezSocket, appConfig.enableNotificationSocket, closeFezSocket, closeNotificationSocket]);

  return (
    <SocketContext.Provider
      value={{
        fezSocket,
        setFezSocket,
        openFezSocket,
        closeFezSocket,
        notificationSocket,
        setNotificationSocket,
        openNotificationSocket,
        closeNotificationSocket,
      }}>
      {children}
    </SocketContext.Provider>
  );
};
