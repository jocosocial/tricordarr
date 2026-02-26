import React, {PropsWithChildren, useCallback, useEffect, useRef, useState} from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useOobe} from '#src/Context/Contexts/OobeContext';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {SocketContext} from '#src/Context/Contexts/SocketContext';
import {useWebSocketStorageReducer, WebSocketStorageActions} from '#src/Context/Reducers/Fez/FezSocketReducer';
import {createLogger} from '#src/Libraries/Logger';
import {buildWebSocket, getToken, OpenFezSocket} from '#src/Libraries/Network/Websockets';

const logger = createLogger('SocketProvider.tsx');

export const SocketProvider = ({children}: PropsWithChildren) => {
  const {isLoggedIn} = useSession();
  const [notificationSocket, setNotificationSocket] = useState<ReconnectingWebSocket>();
  const [fezSockets, dispatchFezSockets] = useWebSocketStorageReducer({});
  const openFezSocketInFlightRef = useRef<Map<string, Promise<OpenFezSocket>>>(new Map());
  const {appConfig} = useConfig();
  const {preRegistrationMode} = usePreRegistration();
  const {oobeCompleted} = useOobe();

  // Socket Open

  /**
   * Open a Fez Socket for a given FezID. Only one Fez Socket can be open at a time.
   * Concurrent calls for the same fezID share a single creation promise to avoid
   * duplicate sockets. Returns whether a new socket was created and the socket to use.
   */
  const openFezSocket = useCallback(
    async (fezID: string): Promise<OpenFezSocket> => {
      if (!appConfig.enableFezSocket) {
        logger.debug('FezSocket is disabled. Skipping open.');
        return {
          isNew: false,
        };
      }
      const existingSocket = fezSockets[fezID];
      if (
        existingSocket &&
        (existingSocket.readyState === WebSocket.OPEN || existingSocket.readyState === WebSocket.CONNECTING)
      ) {
        logger.debug(`FezSocket already exists for ${fezID}. State: ${existingSocket.readyState}`);
        return {isNew: false, ws: existingSocket};
      }
      const pending = openFezSocketInFlightRef.current.get(fezID);
      if (pending) {
        logger.debug(`FezSocket open already in flight for ${fezID}, awaiting.`);
        return pending;
      }
      const promise = (async (): Promise<OpenFezSocket> => {
        try {
          logger.debug(`FezSocket building for ${fezID}.`);
          const ws = await buildWebSocket(fezID);
          logger.debug(`FezSocket open complete for ${fezID}. State: ${ws.readyState}`);
          return {isNew: true, ws};
        } finally {
          openFezSocketInFlightRef.current.delete(fezID);
        }
      })();
      openFezSocketInFlightRef.current.set(fezID, promise);
      return promise;
    },
    [appConfig.enableFezSocket, fezSockets],
  );

  const openNotificationSocket = useCallback(() => {
    // If the notification socket is disabled or we're in pre-registration mode, don't open it.
    // This returns the function early.
    if (!appConfig.enableNotificationSocket || preRegistrationMode) {
      logger.debug('NotificationSocket is disabled. Skipping open.');
      return;
    }
    logger.debug(`NotificationSocket enabled. State: ${notificationSocket?.readyState}`);
    if (
      notificationSocket &&
      (notificationSocket.readyState === WebSocket.OPEN || notificationSocket.readyState === WebSocket.CONNECTING)
    ) {
      logger.debug('NotificationSocket already exists. Skipping buildWebSocket.');
    } else {
      getToken()
        .then(token => {
          if (!token) {
            logger.debug('No token available. Skipping buildWebSocket.');
            return;
          }
          return buildWebSocket();
        })
        .then(ws => ws != null && setNotificationSocket(ws))
        .catch(err => {
          logger.warn('Error building notification socket:', err);
        });
    }
    logger.debug(`NotificationSocket open complete! State: ${notificationSocket?.readyState}`);
  }, [appConfig.enableNotificationSocket, notificationSocket, preRegistrationMode]);

  // Socket Close

  const closeFezSocket = useCallback(
    (fezID: string) => {
      logger.debug('FezSocket is closing.');
      if (!appConfig.enableFezSocket) {
        logger.debug('FezSocket is disabled. Skipping close.');
        return;
      }
      const fezSocket = fezSockets[fezID];
      const readyState = fezSocket?.readyState;
      logger.debug(`FezSocket enabled for ${fezID}. State: ${readyState}`);
      // Close for OPEN, CONNECTING, or CLOSED so the socket is always removed from storage
      // and never reused with a stale message handler (e.g. after navigating back to list).
      if (fezSocket && readyState !== WebSocket.CLOSING) {
        fezSocket.close();
        dispatchFezSockets({
          type: WebSocketStorageActions.delete,
          key: fezID,
        });
      } else if (fezSocket) {
        logger.debug('FezSocket already CLOSING.');
      } else {
        logger.debug(`FezSocket ineligible for close. State: ${readyState}`);
      }
      logger.debug(`FezSocket close complete. State: ${readyState}`);
    },
    [appConfig.enableFezSocket, dispatchFezSockets, fezSockets],
  );

  const closeNotificationSocket = useCallback(() => {
    logger.debug('NotificationSocket is closing.');
    if (
      notificationSocket &&
      (notificationSocket.readyState === WebSocket.OPEN || notificationSocket.readyState === WebSocket.CLOSED)
    ) {
      notificationSocket.close();
      setNotificationSocket(undefined);
    } else {
      logger.debug(`NotificationSocket ineligible for close. State: ${notificationSocket?.readyState}`);
    }
    logger.debug(`NotificationSocket close complete. State: ${notificationSocket?.readyState}`);
  }, [notificationSocket]);

  // Effects

  useEffect(() => {
    logger.debug('Triggering openNotificationSocket useEffect.');
    if (isLoggedIn && oobeCompleted) {
      openNotificationSocket();
    }
    logger.debug('Finished openNotificationSocket useEffect.');
  }, [openNotificationSocket, isLoggedIn, oobeCompleted]);

  useEffect(() => {
    logger.debug('Triggering socket close useEffect.');
    if (!appConfig.enableNotificationSocket) {
      logger.debug('NotificationSocket is disabled. Explicitly closing.');
      closeNotificationSocket();
    }
    // if (!appConfig.enableFezSocket) {
    //   logger.debug('FezSocket is disabled. Explicitly closing.');
    //   closeFezSocket();
    // }
    logger.debug('Finished socket close useEffect.');
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
