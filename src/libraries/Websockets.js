import {generateContentNotification} from './Notifications';
import {seamailChannel} from '../notifications/Channels';
import {NotificationType} from './Enums/NotificationType';
import {getLoginData} from "./Storage";
import {getAuthHeaders} from "./APIClient";
import {AppSettings} from "./AppSettings";

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

export async function buildWebSocket() {
  const wsUrl = await buildWebsocketURL();
  const loginData = await getLoginData();
  const authHeaders = getAuthHeaders(undefined, undefined, loginData.token);

  const ws = new WebSocket(wsUrl, null, {headers: authHeaders});
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
  console.warn('Websocket Construction Started.');
  let ws = await getSharedWebSocket();
  if (ws && ws.readyState === WebSocket.OPEN) {
    console.warn('Re-using existing connection');
  } else {
    console.warn('Building new socket connection');
    ws = buildWebSocket();
  }
  console.warn('Websocket Construction Complete.');
  await setSharedWebSocket(ws);
}

const wsErrorHandler = error => console.error('[error]', error);

const wsOpenHandler = () => console.warn('[open] Connection established');

function wsMessageHandler(event) {
  console.log(`[message] Data received from server: ${event.data}`);
  const notificationData = JSON.parse(event.data);
  // @TODO come back to this.
  // let channel = seamailChannel;
  // console.log(event.data.type);
  // switch (event.data.type) {
  //   case NotificationType.seamailUnreadMsg:
  //     console.log("GOT A SEAMAIL!!!!!!!!!!");
  //     channel = seamailChannel;
  //     break;
  // }
  generateContentNotification(notificationData.contentID, 'New Seamail', notificationData.info, seamailChannel);
}

function wsCloseHandler(event) {
  if (event.wasClean) {
    console.warn(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
  } else {
    // e.g. server process killed or network down
    // event.code is usually 1006 in this case
    console.warn(`[close] Connection died, code=${event.code} reason=${event.reason}`);
  }
}
