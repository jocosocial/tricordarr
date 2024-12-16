import {createContext, Dispatch, SetStateAction, useContext} from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';
import {WebSocketStorage} from '../../Reducers/Fez/FezSocketReducer.ts';

interface SocketContextType {
  fezSockets: WebSocketStorage;
  openFezSocket: (fezID: string) => boolean;
  closeFezSocket: (fezID: string) => void;
  notificationSocket?: ReconnectingWebSocket;
  setNotificationSocket: Dispatch<SetStateAction<ReconnectingWebSocket | undefined>>;
  closeNotificationSocket: () => void;
  openNotificationSocket: () => void;
}

export const SocketContext = createContext(<SocketContextType>{});

export const useSocket = () => useContext(SocketContext);
