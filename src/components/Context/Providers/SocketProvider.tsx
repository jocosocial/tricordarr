import React, {useState, PropsWithChildren, useEffect} from 'react';
import {SocketContext} from '../Contexts/SocketContext';
import {buildFezSocket} from '../../../libraries/Network/Websockets';
import ReconnectingWebSocket from 'reconnecting-websocket';

export const SocketProvider = ({children}: PropsWithChildren) => {
  const [fezSocket, setFezSocket] = useState<ReconnectingWebSocket>();
  const [notificationSocket, setNotificationSocket] = useState<ReconnectingWebSocket>();

  console.log('Rendering Provider');

  const openFezSocket = (fezID: string) => {
    console.log(`[fezSocket] open for ${fezID}, state = ${fezSocket?.readyState}`);
    if (fezSocket && (fezSocket.readyState === WebSocket.OPEN || fezSocket.readyState === WebSocket.CONNECTING)) {
      console.log('[fezSocket] socket exists, skipping...');
    } else {
      buildFezSocket(fezID).then(ws => setFezSocket(ws));
    }
    console.log(`[fezSocket] open complete, state = ${fezSocket?.readyState}`);
  };

  const closeFezSocket = () => {
    console.log('[fezSocket] close');
    if (fezSocket && (fezSocket.readyState === WebSocket.OPEN || fezSocket.readyState === WebSocket.CLOSED)) {
      fezSocket.close();
      setFezSocket(undefined);
    } else {
      console.log('[fezSocket] socket ineligible for close. state =', fezSocket?.readyState);
    }
    console.log(`[fezSocket] close complete, state = ${fezSocket?.readyState}`);
  };

  // useEffect(() => {
  //   return () => {
  //     console.log('Closing SocketContext');
  //     closeFezSocket();
  //   };
  // }, [closeFezSocket]);

  return (
    <SocketContext.Provider
      value={{
        fezSocket,
        setFezSocket,
        notificationSocket,
        setNotificationSocket,
        openFezSocket,
        closeFezSocket,
      }}>
      {children}
    </SocketContext.Provider>
  );
};
