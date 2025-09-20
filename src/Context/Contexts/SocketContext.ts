import {createContext, Dispatch, SetStateAction, useContext} from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';

import {OpenFezSocket} from '#src/Libraries/Network/Websockets';
import {WebSocketStorage, WebSocketStorageType} from '#src/Reducers/Fez/FezSocketReducer';

interface SocketContextType {
  fezSockets: WebSocketStorage;
  dispatchFezSockets: Dispatch<WebSocketStorageType>;
  openFezSocket: (fezID: string) => Promise<OpenFezSocket>;
  closeFezSocket: (fezID: string) => void;
  notificationSocket?: ReconnectingWebSocket;
  setNotificationSocket: Dispatch<SetStateAction<ReconnectingWebSocket | undefined>>;
  closeNotificationSocket: () => void;
  openNotificationSocket: () => void;
}

export const SocketContext = createContext(<SocketContextType>{});

export const useSocket = () => useContext(SocketContext);
