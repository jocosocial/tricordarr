import ReconnectingWebSocket from 'reconnecting-websocket';

import {getAppConfig} from '#src/Libraries/AppConfig';
import {getAuthHeaders} from '#src/Libraries/Network/APIClient';
import {StorageKeys} from '#src/Libraries/Storage';
import {TokenStringData} from '#src/Structs/ControllerStructs';
import {WebSocketOptions} from '#src/Types';

/**
 * This function returns a normalized URL of a WebSocket API endpoint to connect to.
 * React-Native does not support all the same properties as browser URL
 * objects. Big sad.
 */
async function buildWebsocketURL(fezID?: string) {
  const {serverUrl, urlPrefix} = await getAppConfig();
  let wsUrl = `${serverUrl}${urlPrefix}/notification/socket`;
  if (fezID) {
    wsUrl = `${serverUrl}${urlPrefix}/fez/${fezID}/socket`;
  }
  if (wsUrl.startsWith('https://')) {
    wsUrl.replace('https', 'wss');
  } else {
    wsUrl.replace('http', 'ws');
  }
  // console.log('[Websockets.ts] Websocket URL is', wsUrl);
  return wsUrl;
}

/**
 * Constructor/initializer function for the WebSocket class used by Reconnecting-Websocket.
 * https://github.com/pladaria/reconnecting-websocket/issues/138
 * @param options
 * @constructor
 */
function WebSocketConstructor(options?: WebSocketOptions) {
  return class extends WebSocket {
    constructor(url: string, protocols: string | string[]) {
      super(url, protocols, options);
    }
  };
}

/**
 * Returns the users current bearer token necessary to communicate with the WebSocket.
 * Based on reading through the internet it seems like this is an anti-pattern. But is
 * something we'd have to re-implement in Swiftarr first. I doubt we're gonna do that.
 */
async function getToken() {
  const rawTokenData = await TokenStringData.getLocal(StorageKeys.TOKEN_STRING_DATA_V2);
  if (rawTokenData) {
    const tokenStringData = JSON.parse(rawTokenData) as TokenStringData;
    return tokenStringData.token;
  }
}

/**
 * Common WebSocket constructor. Used to return an automatically reconnecting WebSocket object
 * for either the User Notification or Fez Sockets from Swiftarr.
 */
export const buildWebSocket = async (fezID?: string) => {
  const wsUrl = await buildWebsocketURL(fezID);
  // The use of a token in the websocket calls is really an antipattern.
  // Or at least seems to be based on the discussions on the internet.
  // Swiftarr should probably fix this some day.
  const token = await getToken();
  const authHeaders = getAuthHeaders(undefined, undefined, token);
  console.log(`Websockets.ts built new socket to ${wsUrl}`);

  // https://www.npmjs.com/package/reconnecting-websocket
  return new ReconnectingWebSocket(wsUrl, [], {
    WebSocket: WebSocketConstructor({
      headers: authHeaders,
    }),
    // https://github.com/pladaria/reconnecting-websocket
    connectionTimeout: 10000,
    maxRetries: 20,
    minReconnectionDelay: 1000,
    maxReconnectionDelay: 30000,
    reconnectionDelayGrowFactor: 2,
    // debug: true,
  });
};

/**
 * Health check for a websocket. Tests to ensure it exists and is open.
 */
export const wsHealthcheck = (ws?: ReconnectingWebSocket) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    console.log('[Websockets.ts] WebSocket is open and healthy');
    return true;
  }
  console.warn('[Websockets.ts] WebSocket is unhealthy!');
  return false;
};

// https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/readyState
export const WebSocketState = {
  0: 'Connecting',
  1: 'Open',
  2: 'Closing',
  3: 'Closed',
  // I made this one up.
  69: 'Uninitialized',
} as const;

export interface OpenFezSocket {
  ws?: ReconnectingWebSocket;
  isNew: boolean;
}
