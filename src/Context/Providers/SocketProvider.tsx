import React, {PropsWithChildren, useCallback, useEffect, useState} from 'react';
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
        logger.debug('FezSocket is disabled. Skipping open.');
        return {
          isNew: false,
        };
      }
      const existingSocket = fezSockets[fezID];
      logger.debug(`FezSocket enabled for ${fezID}. State: ${existingSocket?.readyState}`);
      let isNew = false;
      let ws: ReconnectingWebSocket;
      if (
        existingSocket &&
        (existingSocket.readyState === WebSocket.OPEN || existingSocket.readyState === WebSocket.CONNECTING)
      ) {
        logger.debug('FezSocket already exists. Skipping buildWebSocket.');
        ws = existingSocket;
      } else {
        const newSocket = await buildWebSocket(fezID);
        isNew = true;
        ws = newSocket;
      }
      logger.debug(`FezSocket open complete! State: ${existingSocket?.readyState}`);
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
      logger.debug(`FezSocket enabled for ${fezID}. State: ${fezSocket?.readyState}`);
      if (fezSocket && (fezSocket.readyState === WebSocket.OPEN || fezSocket.readyState === WebSocket.CLOSED)) {
        fezSocket.close();
        dispatchFezSockets({
          type: WebSocketStorageActions.delete,
          key: fezID,
        });
      } else {
        logger.debug(`FezSocket ineligible for close. State: ${fezSocket?.readyState}`);
      }
      logger.debug(`FezSocket close complete. State: ${fezSocket?.readyState}`);
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
