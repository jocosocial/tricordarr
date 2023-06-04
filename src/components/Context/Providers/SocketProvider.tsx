import React, {useState, PropsWithChildren, useCallback, useEffect} from 'react';
import {SocketContext} from '../Contexts/SocketContext';
import {buildWebSocket} from '../../../libraries/Network/Websockets';
import ReconnectingWebSocket from 'reconnecting-websocket';
import {useUserData} from '../Contexts/UserDataContext';
import {useConfig} from '../Contexts/ConfigContext';

export const SocketProvider = ({children}: PropsWithChildren) => {
  const {profilePublicData} = useUserData();
  const [notificationSocket, setNotificationSocket] = useState<ReconnectingWebSocket>();
  const [fezSocket, setFezSocket] = useState<ReconnectingWebSocket>();
  const {appConfig} = useConfig();

  const openFezSocket = useCallback(
    (fezID: string) => {
      if (!appConfig.enableFezSocket) {
        console.log('[fezSocket] skipping open, fez sockets are disabled');
        return;
      }
      console.log(`[fezSocket] open for ${fezID}, state = ${fezSocket?.readyState}`);
      if (fezSocket && (fezSocket.readyState === WebSocket.OPEN || fezSocket.readyState === WebSocket.CONNECTING)) {
        console.log('[fezSocket] socket exists, skipping...');
      } else {
        buildWebSocket(fezID).then(ws => setFezSocket(ws));
      }
      console.log(`[fezSocket] open complete, state = ${fezSocket?.readyState}`);
    },
    [appConfig.enableFezSocket, fezSocket],
  );

  const closeFezSocket = useCallback(() => {
    console.log('[fezSocket] close');
    if (fezSocket && (fezSocket.readyState === WebSocket.OPEN || fezSocket.readyState === WebSocket.CLOSED)) {
      fezSocket.close();
      setFezSocket(undefined);
    } else {
      console.log('[fezSocket] socket ineligible for close. state =', fezSocket?.readyState);
    }
    console.log(`[fezSocket] close complete, state = ${fezSocket?.readyState}`);
  }, [fezSocket]);

  // @TODO unify these.
  const openNotificationSocket = useCallback(() => {
    if (!appConfig.enableNotificationSocket) {
      console.log('[NotificationSocket] skipping open, notification sockets are disabled');
      return;
    }
    console.log(`[NotificationSocket] open, state = ${notificationSocket?.readyState}`);
    if (
      notificationSocket &&
      (notificationSocket.readyState === WebSocket.OPEN || notificationSocket.readyState === WebSocket.CONNECTING)
    ) {
      console.log('[NotificationSocket] socket exists, skipping...');
    } else {
      buildWebSocket().then(ws => setNotificationSocket(ws));
    }
    console.log(`[NotificationSocket] open complete, state = ${notificationSocket?.readyState}`);
  }, [appConfig.enableNotificationSocket, notificationSocket]);

  const closeNotificationSocket = useCallback(() => {
    console.log('[NotificationSocket] close');
    if (
      notificationSocket &&
      (notificationSocket.readyState === WebSocket.OPEN || notificationSocket.readyState === WebSocket.CLOSED)
    ) {
      notificationSocket.close();
      setNotificationSocket(undefined);
    } else {
      console.log('[NotificationSocket] socket ineligible for close. state =', notificationSocket?.readyState);
    }
    console.log(`[NotificationSocket] close complete, state = ${notificationSocket?.readyState}`);
  }, [notificationSocket]);

  useEffect(() => {
    if (profilePublicData) {
      openNotificationSocket();
    }
  }, [openNotificationSocket, profilePublicData]);

  useEffect(() => {
    if (!appConfig.enableNotificationSocket) {
      console.log('[NotificationSocket] notification sockets are disabled. Explicitly closing.');
      closeNotificationSocket();
    }
    if (!appConfig.enableFezSocket) {
      console.log('[fezSocket] fez sockets are disabled. Explicitly closing.');
      closeFezSocket();
    }
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
        closeNotificationSocket,
      }}>
      {children}
    </SocketContext.Provider>
  );
};
