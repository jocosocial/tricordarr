import ReconnectingWebSocket from 'reconnecting-websocket';

import {getAppConfig} from '#src/Libraries/AppConfig';
import {createLogger} from '#src/Libraries/Logger';
import {getAuthHeaders} from '#src/Libraries/Network/APIClient';
import {SessionStorage} from '#src/Libraries/Storage/SessionStorage';
import {WebSocketOptions} from '#src/Types';

const logger = createLogger('Websockets.ts');

/**
 * Converts an http/https URL to ws/wss for WebSocket connections.
 */
const normalizeToWebSocketUrl = (url: string): string => {
  if (url.startsWith('https://')) {
    return url.replace('https', 'wss');
  }
  return url.replace('http', 'ws');
};

/**
 * Builds a full WebSocket URL from session serverUrl, app urlPrefix, and path suffix,
 * then normalizes to ws/wss. Used by all socket types.
 */
const buildNormalizedWebSocketUrl = async (pathSuffix: string, errorContext?: string): Promise<string> => {
  const session = await SessionStorage.getCurrentSession();
  if (!session?.serverUrl) {
    const suffix = errorContext ? ` ${errorContext}` : '';
    throw new Error(`[Websockets.ts] No current session found or session missing serverUrl${suffix}`);
  }
  const {urlPrefix} = await getAppConfig();
  const httpUrl = `${session.serverUrl}${urlPrefix}${pathSuffix}`;
  return normalizeToWebSocketUrl(httpUrl);
};

/**
 * This function returns a normalized URL of a WebSocket API endpoint to connect to.
 * Reads the serverUrl from the current session via LAST_SESSION_ID lookup, which works
 * for background workers that cannot access React context.
 * React-Native does not support all the same properties as browser URL
 * objects. Big sad.
 */
export const buildWebsocketURL = async (fezID?: string) => {
  const pathSuffix = fezID ? `/fez/${fezID}/socket` : '/notification/socket';
  return buildNormalizedWebSocketUrl(pathSuffix);
};

/**
 * Constructor/initializer function for the WebSocket class used by Reconnecting-Websocket.
 * https://github.com/pladaria/reconnecting-websocket/issues/138
 * @param options
 * @constructor
 */
const WebSocketConstructor = (options?: WebSocketOptions) => {
  return class extends WebSocket {
    constructor(url: string, protocols: string | string[]) {
      super(url, protocols, options);
    }
  };
};

/**
 * Returns the users current bearer token necessary to communicate with the WebSocket.
 * Reads from the current session via LAST_SESSION_ID lookup, which works for background
 * workers that cannot access React context.
 * Based on reading through the internet it seems like this is an anti-pattern. But is
 * something we'd have to re-implement in Swiftarr first. I doubt we're gonna do that.
 */
export const getToken = async () => {
  const session = await SessionStorage.getCurrentSession();
  if (session?.tokenData?.token) {
    return session.tokenData.token;
  }
  return undefined;
};

const DEFAULT_RECONNECT_OPTIONS = {
  connectionTimeout: 10000,
  maxRetries: 20,
  minReconnectionDelay: 1000,
  maxReconnectionDelay: 30000,
  reconnectionDelayGrowFactor: 2,
} as const;

type ReconnectOptionsOverrides = Partial<{
  maxRetries: number;
  minReconnectionDelay: number;
  maxReconnectionDelay: number;
}>;

/**
 * Shared factory: resolves auth (token + headers), creates a ReconnectingWebSocket with
 * default options and optional overrides, and runs an optional post-create callback.
 */
const createReconnectingWebSocket = async (
  wsUrl: string,
  optionsOverrides?: ReconnectOptionsOverrides,
  postCreate?: (ws: ReconnectingWebSocket) => void,
): Promise<ReconnectingWebSocket> => {
  // The use of a token in the websocket calls is really an antipattern.
  // Or at least seems to be based on the discussions on the internet.
  // Swiftarr should probably fix this some day.
  const token = await getToken();
  const authHeaders = getAuthHeaders(undefined, undefined, token);
  const options = {...DEFAULT_RECONNECT_OPTIONS, ...optionsOverrides};
  const ws = new ReconnectingWebSocket(wsUrl, [], {
    WebSocket: WebSocketConstructor({
      headers: authHeaders,
    }),
    ...options,
  });
  if (postCreate) {
    postCreate(ws);
  }
  return ws;
};

/**
 * Common WebSocket constructor. Used to return an automatically reconnecting WebSocket object
 * for either the User Notification or Fez Sockets from Swiftarr.
 */
export const buildWebSocket = async (fezID?: string) => {
  const wsUrl = await buildWebsocketURL(fezID);
  logger.debug(`built new socket to ${wsUrl}`);
  return createReconnectingWebSocket(wsUrl);
};

/**
 * Health check for a websocket. Tests to ensure it exists and is open.
 */
export const wsHealthcheck = (ws?: ReconnectingWebSocket) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    logger.debug('WebSocket is open and healthy');
    return true;
  }
  logger.warn('WebSocket is unhealthy!');
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

/**
 * Build a WebSocket connection for phone calls.
 * For caller: connects to /phone/socket/initiate/{callID}/to/{userID}
 * For callee: connects to /phone/socket/answer/{callID}
 */
export const buildPhoneCallWebSocket = async (callID: string, userID?: string) => {
  const pathSuffix = userID ? `/phone/socket/initiate/${callID}/to/${userID}` : `/phone/socket/answer/${callID}`;
  const wsUrl = await buildNormalizedWebSocketUrl(pathSuffix, 'for phone call');
  logger.debug(`built new phone call socket to ${wsUrl}`);

  // Phone calls are time-sensitive - don't retry on failure
  return createReconnectingWebSocket(
    wsUrl,
    {
      maxRetries: 0,
      minReconnectionDelay: 500,
      maxReconnectionDelay: 2000,
    },
    ws => {
      // Set binaryType to 'arraybuffer' to receive binary messages as ArrayBuffer instead of Blob
      // This ensures consistent handling across platforms in React Native
      // ReconnectingWebSocket should proxy this to the underlying WebSocket
      if ('binaryType' in ws) {
        (ws as ReconnectingWebSocket & {binaryType: string}).binaryType = 'arraybuffer';
      }
    },
  );
};
