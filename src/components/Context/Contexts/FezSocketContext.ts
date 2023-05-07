import {createContext, Dispatch, SetStateAction, useContext} from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';

interface FezSocketContextType {
  fezSocket?: ReconnectingWebSocket;
  setFezSocket: Dispatch<SetStateAction<ReconnectingWebSocket | undefined>>;
  openFezSocket: (fezID: string) => void;
  closeFezSocket: () => void;
}

export const FezSocketContext = createContext(<FezSocketContextType>{});

export const useFezSocket = () => useContext(FezSocketContext);
