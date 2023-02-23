import {generateContentNotification} from "./Notifications";
import {seamailChannel} from "../notifications/Channels";
import {NotificationType} from "./Enums/NotificationType";

/**
 * Browser Websocket doesn't support the ping function.
 * https://github.com/websockets/ws doesn't support React-Native + Android.
 * Sad.
 */
export function setupWebsocket(endpoint, options = {}) {
  const ws = new WebSocket(endpoint, null, options);
  ws.onerror = wsErrorHandler;
  ws.onopen = wsOpenHandler;
  ws.onmessage = wsMessageHandler;
  ws.onclose = wsCloseHandler;
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
    console.log('[close] Connection died');
  }
}
