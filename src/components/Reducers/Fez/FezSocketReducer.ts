import ReconnectingWebSocket from 'reconnecting-websocket';
import {useReducer} from 'react';

export interface WebSocketStorage {
  [key: string]: ReconnectingWebSocket;
}

export enum WebSocketStorageActions {
  upsert = 'UPSERT',
  delete = 'DELETE',
}

export type WebSocketStorageType =
  | {type: WebSocketStorageActions.upsert; key: string; socket: ReconnectingWebSocket}
  | {type: WebSocketStorageActions.delete; key: string};

const webSocketStorageReducer = (storage: WebSocketStorage, action: WebSocketStorageType) => {
  console.log('[WebSocketStorageReducer.ts] Got action:', action.type);
  switch (action.type) {
    case WebSocketStorageActions.upsert: {
      return {
        ...storage,
        [action.key]: action.socket,
      };
    }
    case WebSocketStorageActions.delete: {
      const localStorage = storage;
      delete localStorage[action.key];
      return localStorage;
    }
    default: {
      throw new Error(`Unknown WebSocketStorageActions: ${action}`);
    }
  }
};

export const useWebSocketStorageReducer = (initialState: WebSocketStorage = {}) =>
  useReducer(webSocketStorageReducer, initialState);
