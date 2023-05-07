import {createContext, Dispatch, SetStateAction, useContext} from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';

interface NotificationSocketContextType {
  notificationSocket?: ReconnectingWebSocket;
  setNotificationSocket: Dispatch<SetStateAction<ReconnectingWebSocket | undefined>>;
}

export const NotificationSocketContext = createContext(<NotificationSocketContextType>{});

export const useNotificationSocket = () => useContext(NotificationSocketContext);
