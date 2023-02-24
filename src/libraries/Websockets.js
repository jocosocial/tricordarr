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

export const getSharedWebSocket = () => sharedWebSocket;
export const setSharedWebSocket = ws => (sharedWebSocket = ws);

/**
 * Browser Websocket doesn't support the ping function.
 * https://github.com/websockets/ws doesn't support React-Native + Android.
 * Sad.
 */
export async function setupWebsocket(ws) {
  console.log('Websocket Construction Started.');
  const wsUrl = await buildWebsocketURL();
  const loginData = await getLoginData();
  const authHeaders = getAuthHeaders(undefined, undefined, loginData.token);

  ws = new WebSocket(wsUrl, null, {headers: authHeaders});
  ws.onerror = wsErrorHandler;
  ws.onopen = wsOpenHandler;
  ws.onmessage = wsMessageHandler;
  ws.onclose = wsCloseHandler;

  console.log('Websocket Construction Complete.');
  return ws;
}

const wsErrorHandler = error => console.error('[error]', error);

const wsOpenHandler = () => console.log('[open] Connection established');

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
    console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
  } else {
    // e.g. server process killed or network down
    // event.code is usually 1006 in this case
    console.log(`[close] Connection died, code=${event.code} reason=${event.reason}`);
  }
}
