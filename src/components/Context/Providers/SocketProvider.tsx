import React, {useState, PropsWithChildren} from 'react';
import {SocketContext} from '../Contexts/SocketContext';
import {buildFezSocket} from '../../../libraries/Network/Websockets';
import ReconnectingWebSocket from 'reconnecting-websocket';

export const SocketProvider = ({children}: PropsWithChildren) => {
  const [fezSocket, setFezSocket] = useState<ReconnectingWebSocket>();
  const [notificationSocket, setNotificationSocket] = useState<ReconnectingWebSocket>();

  const openFezSocket = (fezID: string) => {
    console.log(`[fezSocket] open for ${fezID}`);
    buildFezSocket(fezID).then(ws => setFezSocket(ws));
  };
  const closeFezSocket = () => {
    console.log('[fezSocket] close');
    fezSocket?.close();
    setFezSocket(undefined);
  };

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
