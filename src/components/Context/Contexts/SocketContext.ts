import {createContext, Dispatch, SetStateAction, useContext} from 'react';

interface SocketContextType {
  fezSocket?: WebSocket;
  setFezSocket: Dispatch<SetStateAction<WebSocket | undefined>>;
  notificationSocket?: WebSocket;
  setNotificationSocket: Dispatch<SetStateAction<WebSocket | undefined>>;
  openFezSocket: Function;
  closeFezSocket: Function;
}

export const SocketContext = createContext(<SocketContextType>{});

export const useSocket = () => useContext(SocketContext);
