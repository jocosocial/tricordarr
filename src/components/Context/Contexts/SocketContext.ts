import {createContext, Dispatch, SetStateAction, useContext} from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';

interface SocketContextType {
  fezSocket?: ReconnectingWebSocket;
  setFezSocket: Dispatch<SetStateAction<ReconnectingWebSocket | undefined>>;
  openFezSocket: (fezID: string) => void;
  closeFezSocket: () => void;
  notificationSocket?: ReconnectingWebSocket;
  setNotificationSocket: Dispatch<SetStateAction<ReconnectingWebSocket | undefined>>;
  closeNotificationSocket: () => void;
}

export const SocketContext = createContext(<SocketContextType>{});

export const useSocket = () => useContext(SocketContext);
