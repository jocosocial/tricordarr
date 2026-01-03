import React, {PropsWithChildren, useCallback, useEffect, useState} from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useOobe} from '#src/Context/Contexts/OobeContext';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {SocketContext} from '#src/Context/Contexts/SocketContext';
import {buildWebSocket, OpenFezSocket} from '#src/Libraries/Network/Websockets';
import {useWebSocketStorageReducer, WebSocketStorageActions} from '#src/Reducers/Fez/FezSocketReducer';

export const SocketProvider = ({children}: PropsWithChildren) => {
  const {isLoggedIn} = useSession();
  const [notificationSocket, setNotificationSocket] = useState<ReconnectingWebSocket>();
  const [fezSockets, dispatchFezSockets] = useWebSocketStorageReducer({});
  const {appConfig} = useConfig();
  const {preRegistrationMode} = usePreRegistration();
  const {oobeCompleted} = useOobe();

  // Socket Open

  /**
   * Open a Fez Socket for a given FezID. Only one Fez Socket can be open at a time.
   * If sockets are disabled, then don't do anything. If a socket already
   * exists and is open, then don't do anything. But otherwise, try building a new one.
   * Returns a boolean whether a new socket was created or not.
   */
  const openFezSocket = useCallback(
    async (fezID: string): Promise<OpenFezSocket> => {
      if (!appConfig.enableFezSocket) {
        console.log('[SocketProvider.tsx] FezSocket is disabled. Skipping open.');
        return {
          isNew: false,
        };
      }
      const existingSocket = fezSockets[fezID];
      console.log(`[SocketProvider.tsx] FezSocket enabled for ${fezID}. State: ${existingSocket?.readyState}`);
      let isNew = false;
      let ws: ReconnectingWebSocket;
      if (
        existingSocket &&
        (existingSocket.readyState === WebSocket.OPEN || existingSocket.readyState === WebSocket.CONNECTING)
      ) {
        console.log('[SocketProvider.tsx] FezSocket already exists. Skipping buildWebSocket.');
        ws = existingSocket;
      } else {
        const newSocket = await buildWebSocket(fezID);
        isNew = true;
        ws = newSocket;
      }
      console.log(`[SocketProvider.tsx] FezSocket open complete! State: ${existingSocket?.readyState}`);
      return {
        isNew: isNew,
        ws: ws,
      };
    },
    [appConfig.enableFezSocket, fezSockets],
  );

  const openNotificationSocket = useCallback(() => {
    // If the notification socket is disabled or we're in pre-registration mode, don't open it.
    // This returns the function early.
    if (!appConfig.enableNotificationSocket || preRegistrationMode) {
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
  }, [appConfig.enableNotificationSocket, notificationSocket, preRegistrationMode]);

  // Socket Close

  const closeFezSocket = useCallback(
    (fezID: string) => {
      console.log('[SocketProvider.tsx] FezSocket is closing.');
      if (!appConfig.enableFezSocket) {
        console.log('[SocketProvider.tsx] FezSocket is disabled. Skipping close.');
        return;
      }
      const fezSocket = fezSockets[fezID];
      console.log(`[SocketProvider.tsx] FezSocket enabled for ${fezID}. State: ${fezSocket?.readyState}`);
      if (fezSocket && (fezSocket.readyState === WebSocket.OPEN || fezSocket.readyState === WebSocket.CLOSED)) {
        fezSocket.close();
        dispatchFezSockets({
          type: WebSocketStorageActions.delete,
          key: fezID,
        });
      } else {
        console.log(`[SocketProvider.tsx] FezSocket ineligible for close. State: ${fezSocket?.readyState}`);
      }
      console.log(`[SocketProvider.tsx] FezSocket close complete. State: ${fezSocket?.readyState}`);
    },
    [appConfig.enableFezSocket, dispatchFezSockets, fezSockets],
  );

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
    // if (!appConfig.enableFezSocket) {
    //   console.log('[SocketProvider.tsx] FezSocket is disabled. Explicitly closing.');
    //   closeFezSocket();
    // }
    console.log('[SocketProvider.tsx] Finished socket close useEffect.');
  }, [appConfig.enableFezSocket, appConfig.enableNotificationSocket, closeFezSocket, closeNotificationSocket]);

  return (
    <SocketContext.Provider
      value={{
        fezSockets,
        dispatchFezSockets,
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
