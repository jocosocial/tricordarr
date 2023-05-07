import React, {useState, PropsWithChildren, useEffect, useCallback} from 'react';
import {buildWebSocket} from '../../../libraries/Network/Websockets';
import ReconnectingWebSocket from 'reconnecting-websocket';
import {useUserData} from '../Contexts/UserDataContext';
import {NotificationSocketContext} from '../Contexts/NotificationSocketContext';

export const NotificationSocketProvider = ({children}: PropsWithChildren) => {
  const {profilePublicData} = useUserData();
  const [notificationSocket, setNotificationSocket] = useState<ReconnectingWebSocket>();

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

  // @TODO this doesnt quite work. If the provider is changed it abandons the existing connection
  useEffect(() => {
    if (profilePublicData) {
      openNotificationSocket();
    }
  }, [openNotificationSocket, profilePublicData]);

  return (
    <NotificationSocketContext.Provider
      value={{
        notificationSocket,
        setNotificationSocket,
      }}>
      {children}
    </NotificationSocketContext.Provider>
  );
};
