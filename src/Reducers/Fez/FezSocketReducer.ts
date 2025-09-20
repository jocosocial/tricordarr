import {useReducer} from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';

export interface WebSocketStorage {
  [key: string]: ReconnectingWebSocket;
}

export enum WebSocketStorageActions {
  upsert = 'UPSERT',
  delete = 'DELETE',
  clear = 'CLEAR',
}

export type WebSocketStorageType =
  | {type: WebSocketStorageActions.upsert; key: string; socket: ReconnectingWebSocket}
  | {type: WebSocketStorageActions.delete; key: string}
  | {type: WebSocketStorageActions.clear};

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
    case WebSocketStorageActions.clear: {
      // @TODO should this also close?
      return {};
    }
    default: {
      throw new Error(`Unknown WebSocketStorageActions: ${action}`);
    }
  }
};

export const useWebSocketStorageReducer = (initialState: WebSocketStorage = {}) =>
  useReducer(webSocketStorageReducer, initialState);
