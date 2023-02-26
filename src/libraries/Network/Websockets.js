import {generateContentNotification} from '../Notifications';
import {seamailChannel} from '../../notifications/Channels';
import {NotificationType} from '../Enums/NotificationType';
import {getAuthHeaders} from './APIClient';
import {AppSettings} from '../AppSettings';
import ReconnectingWebSocket from 'reconnecting-websocket';

/**
 * React-Native does not support all the same properties as browser URL
 * objects. Big sad.
 */
async function buildWebsocketURL() {
  const serverHttpUrl = await AppSettings.SERVER_URL.getValue();
  const serverApiPrefix = await AppSettings.URL_PREFIX.getValue();
  let wsUrl = `${serverHttpUrl}${serverApiPrefix}/notification/socket`;
  if (wsUrl.startsWith('https://')) {
    wsUrl.replace('https', 'wss');
  } else {
    wsUrl.replace('http', 'ws');
  }
  console.log('Websocket URL is', wsUrl);
  return wsUrl;
}

let sharedWebSocket;

export const getSharedWebSocket = async () => sharedWebSocket;
export const setSharedWebSocket = async ws => (sharedWebSocket = ws);

// https://github.com/pladaria/reconnecting-websocket/issues/138
function createWebSocketClass(options) {
  return class extends WebSocket {
    constructor(url, protocols) {
      super(url, protocols, options);
    }
  };
}

export async function buildWebSocket() {
  console.debug('buildWebSocket called');
  const wsUrl = await buildWebsocketURL();
  const token = await AppSettings.AUTH_TOKEN.getValue();
  const authHeaders = getAuthHeaders(undefined, undefined, token);

  // https://www.npmjs.com/package/reconnecting-websocket
  const ws = new ReconnectingWebSocket(wsUrl, [], {
    WebSocket: createWebSocketClass({
      headers: authHeaders,
    }),
    connectionTimeout: 10000,
    maxRetries: 5,
    minReconnectionDelay: 1000,
    maxReconnectionDelay: 5000,
    // debug: true,
    reconnectionDelayGrowFactor: 2,
  });
  // const ws = new WebSocket(wsUrl, null, {headers: authHeaders});
  ws.onerror = wsErrorHandler;
  ws.onopen = wsOpenHandler;
  ws.onmessage = wsMessageHandler;
  ws.onclose = wsCloseHandler;
  return ws;
}

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

const wsErrorHandler = error => console.error('[error]', error);

const wsOpenHandler = () => console.log('[open] Connection established');

function wsMessageHandler(event) {
  console.log(`[message] Data received from server: ${event.data}`);
  const notificationData = JSON.parse(event.data);
  const type = Object.keys(notificationData.type)[0];
  let channel, url;

  switch (type) {
    case NotificationType.seamailUnreadMsg:
      console.log('GOT A SEAMAIL!!!!!!!!!!');
      channel = seamailChannel;
      url = `/seamail/${notificationData.contentID}#newposts`;
      break;
  }

  generateContentNotification(notificationData.contentID, 'New Seamail', notificationData.info, channel, type, url);
}

async function wsCloseHandler(event) {
  if (event.wasClean) {
    console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
  } else {
    // e.g. server process killed or network down
    // event.code is usually 1006 in this case
    console.log(`[close] Connection died, code=${event.code} reason=${event.reason}`);
  }
  // https://github.com/pladaria/reconnecting-websocket/issues/78
  if (event.code === 1000) {
    const ws = await getSharedWebSocket();
    ws.close();
  }
}
