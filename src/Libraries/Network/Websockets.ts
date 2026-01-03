import ReconnectingWebSocket from 'reconnecting-websocket';

import {getAppConfig} from '#src/Libraries/AppConfig';
import {getAuthHeaders} from '#src/Libraries/Network/APIClient';
import {SessionStorage} from '#src/Libraries/Storage/SessionStorage';
import {WebSocketOptions} from '#src/Types';

/**
 * This function returns a normalized URL of a WebSocket API endpoint to connect to.
 * Reads the serverUrl from the current session via LAST_SESSION_ID lookup, which works
 * for background workers that cannot access React context.
 * React-Native does not support all the same properties as browser URL
 * objects. Big sad.
 */
export async function buildWebsocketURL(fezID?: string) {
  const session = await SessionStorage.getCurrentSession();
  if (!session?.serverUrl) {
    throw new Error('[Websockets.ts] No current session found or session missing serverUrl');
  }

  const {urlPrefix} = await getAppConfig();
  let wsUrl = `${session.serverUrl}${urlPrefix}/notification/socket`;
  if (fezID) {
    wsUrl = `${session.serverUrl}${urlPrefix}/fez/${fezID}/socket`;
  }
  if (wsUrl.startsWith('https://')) {
    wsUrl = wsUrl.replace('https', 'wss');
  } else {
    wsUrl = wsUrl.replace('http', 'ws');
  }
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
 * Reads from the current session via LAST_SESSION_ID lookup, which works for background
 * workers that cannot access React context.
 * Based on reading through the internet it seems like this is an anti-pattern. But is
 * something we'd have to re-implement in Swiftarr first. I doubt we're gonna do that.
 */
export async function getToken() {
  const session = await SessionStorage.getCurrentSession();
  if (session?.tokenData?.token) {
    return session.tokenData.token;
  }
  return undefined;
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
  console.log(`[Websockets.ts] built new socket to ${wsUrl}`);

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
