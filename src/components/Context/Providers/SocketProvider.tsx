import React, {useState, PropsWithChildren, useCallback, useEffect} from 'react';
import {SocketContext} from '../Contexts/SocketContext';
import {buildWebSocket} from '../../../libraries/Network/Websockets';
import ReconnectingWebSocket from 'reconnecting-websocket';
import {useUserData} from '../Contexts/UserDataContext';

export const SocketProvider = ({children}: PropsWithChildren) => {
  const {profilePublicData} = useUserData();
  const [notificationSocket, setNotificationSocket] = useState<ReconnectingWebSocket>();
  const [fezSocket, setFezSocket] = useState<ReconnectingWebSocket>();

  const openFezSocket = useCallback(
    (fezID: string) => {
      console.log(`[fezSocket] open for ${fezID}, state = ${fezSocket?.readyState}`);
      if (fezSocket && (fezSocket.readyState === WebSocket.OPEN || fezSocket.readyState === WebSocket.CONNECTING)) {
        console.log('[fezSocket] socket exists, skipping...');
      } else {
        buildWebSocket(fezID).then(ws => setFezSocket(ws));
      }
      console.log(`[fezSocket] open complete, state = ${fezSocket?.readyState}`);
    },
    [fezSocket],
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
  }, [notificationSocket]);

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
