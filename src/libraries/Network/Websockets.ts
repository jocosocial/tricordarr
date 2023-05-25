import {generateContentNotification} from '../Notifications/Content';
import {lfgChannel, seamailChannel, serviceChannel} from '../Notifications/Channels';
import {NotificationType, PressAction} from '../Enums/Notifications';
import {getAuthHeaders} from './APIClient';
import {AppSettings} from '../AppSettings';
import ReconnectingWebSocket from 'reconnecting-websocket';
import {TokenStringData} from '../Structs/ControllerStructs';
import {WebSocketOptions} from '../Types';

/**
 * React-Native does not support all the same properties as browser URL
 * objects. Big sad.
 */
async function buildWebsocketURL(fezID?: string) {
  const serverHttpUrl = await AppSettings.SERVER_URL.getValue();
  const serverApiPrefix = await AppSettings.URL_PREFIX.getValue();
  let wsUrl = `${serverHttpUrl}${serverApiPrefix}/notification/socket`;
  if (fezID) {
    wsUrl = `${serverHttpUrl}${serverApiPrefix}/fez/${fezID}/socket`;
  }
  if (wsUrl.startsWith('https://')) {
    wsUrl.replace('https', 'wss');
  } else {
    wsUrl.replace('http', 'ws');
  }
  console.log('Websocket URL is', wsUrl);
  return wsUrl;
}

let sharedWebSocket: ReconnectingWebSocket;

export const getSharedWebSocket = async () => sharedWebSocket;
export const setSharedWebSocket = async (ws: ReconnectingWebSocket) => (sharedWebSocket = ws);

// https://github.com/pladaria/reconnecting-websocket/issues/138
function WebSocketConstructor(options?: WebSocketOptions) {
  return class extends WebSocket {
    constructor(url: string, protocols: string | string[]) {
      super(url, protocols, options);
    }
  };
}

async function getToken() {
  const rawTokenData = await AppSettings.TOKEN_STRING_DATA.getValue();
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

// export async function buildWebSocketOld(fezID?: string) {
//   console.log('buildWebSocket called');
//   const wsUrl = await buildWebsocketURL(fezID);
//   const token = await getToken();
//   const authHeaders = getAuthHeaders(undefined, undefined, token);
//
//   // https://www.npmjs.com/package/reconnecting-websocket
//   const ws = new ReconnectingWebSocket(wsUrl, [], {
//     WebSocket: WebSocketConstructor({
//       headers: authHeaders,
//     }),
//     // https://github.com/pladaria/reconnecting-websocket
//     connectionTimeout: 10000,
//     maxRetries: 20,
//     minReconnectionDelay: 1000,
//     maxReconnectionDelay: 30000,
//     reconnectionDelayGrowFactor: 2,
//     // debug: true,
//   });
//   ws.onerror = wsErrorHandler;
//   ws.onopen = wsOpenHandler;
//   ws.onmessage = wsMessageHandler;
//   ws.onclose = wsCloseHandler;
//   return ws;
// }

/**
 * Browser Websocket doesn't support the ping function.
 * https://github.com/websockets/ws doesn't support React-Native + Android.
 * Sad.
 */
export async function setupWebsocket() {
  console.log('Websocket Construction Started.');
  let ws = await getSharedWebSocket();
  if (ws && ws.readyState === WebSocket.OPEN) {
    console.log('Re-using existing connection');
  } else {
    console.log('Building new socket connection');
    ws = await buildWebSocket();
  }
  console.log('Websocket Construction Complete.');
  await setSharedWebSocket(ws);
}

export async function wsHealthcheck() {
  let ws = await getSharedWebSocket();
  if (ws && ws.readyState === WebSocket.OPEN) {
    console.log('WebSocket is open and healthy');
    await AppSettings.WS_HEALTHCHECK_DATE.setValue(new Date().toISOString());
    return true;
  }
  console.warn('WebSocket is unhealthy!');
  return false;
}

const wsErrorHandler = (error: WebSocketErrorEvent) => console.error('[error]', error);

const wsOpenHandler = async () => {
  console.log('[open] Connection established');
  await AppSettings.WS_OPEN_DATE.setValue(new Date().toISOString());
};

function wsMessageHandler(event: WebSocketMessageEvent) {
  console.log(`[message] Data received from server: ${event.data}`);
  const notificationData = JSON.parse(event.data);
  const type = Object.keys(notificationData.type)[0];
  let channel = serviceChannel;
  let url: string = '';
  let pressActionID = PressAction.twitarrTab;

  switch (type) {
    case NotificationType.seamailUnreadMsg:
      console.log('GOT A SEAMAIL!!!!!!!!!!');
      channel = seamailChannel;
      url = `/seamail/${notificationData.contentID}`;
      pressActionID = PressAction.seamail;
      break;
    case NotificationType.fezUnreadMsg:
      console.log('GOT A LFG MESSAGE!!!!!!!!!!');
      channel = lfgChannel;
      url = `/fez/${notificationData.contentID}#newposts`;
      break;
  }

  generateContentNotification(
    notificationData.contentID,
    'New Seamail',
    notificationData.info,
    channel,
    type,
    url,
    pressActionID,
  );
}

async function wsCloseHandler(event: WebSocketCloseEvent) {
  // e.g. server process killed or network down
  // event.code is usually 1006 in this case
  console.log(`[close] Connection died, code=${event.code} reason=${event.reason}`);
  // https://github.com/pladaria/reconnecting-websocket/issues/78
  if (event.code === 1000) {
    const ws = await getSharedWebSocket();
    ws.close();
  }
  await AppSettings.WS_OPEN_DATE.remove();
  // I think I want to keep the healthcheck date around.
  // await AppSettings.WS_HEALTHCHECK_DATE.remove();
}

// https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/readyState
export const WebSocketState = {
  0: 'Connecting',
  1: 'Open',
  2: 'Closing',
  3: 'Closed',
} as const;
