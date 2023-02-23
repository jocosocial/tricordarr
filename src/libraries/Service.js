import {getLoginData} from "./Storage";
import {getAuthHeaders} from "./APIClient";
import notifee, {AndroidColor} from "@notifee/react-native";
import {seamailChannel, serviceChannel} from "../notifications/Channels";
import {AppSettings} from "./AppSettings";

// React-Native does not support all the same properties as browser URL
// objects. Big sad.
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

// https://javascript.info/websocket
async function fgsWorker() {
  console.log('Foreground Service');
  const wsUrl = await buildWebsocketURL();
  const loginData = await getLoginData();
  const authHeaders = getAuthHeaders(undefined, undefined, loginData.token);
  let socket = new WebSocket(wsUrl, null, {
    headers: authHeaders,
  });

  socket.onopen = function (e) {
    console.log('[open] Connection established');
    console.log('Sending to server');
    socket.send('PING');
  };

  socket.onmessage = function (event) {
    console.log(`[message] Data received from server: ${event.data}`);
    const notificationData = JSON.parse(event.data);
    console.log(notificationData);
    notifee.displayNotification({
      id: notificationData.contentID,
      title: 'New Seamail Message',
      body: notificationData.info,
      android: {
        channelId: seamailChannel.id,
        // smallIcon: 'mail', // optional, defaults to 'ic_launcher'.
        autoCancel: true,
        // https://notifee.app/react-native/docs/android/interaction
        pressAction: {
          id: 'default',
        },
      },
    });
  };

  socket.onclose = function (event) {
    if (event.wasClean) {
      console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
    } else {
      // e.g. server process killed or network down
      // event.code is usually 1006 in this case
      console.log('[close] Connection died');
    }
  };

  socket.onerror = function (error) {
    console.log('[error] ', error);
  };
}

export function registerForegroundServiceWorker() {
  console.log('Registering Foreground Service Worker');
  notifee.registerForegroundService(() => {
    return new Promise(fgsWorker);
  });
}

export async function stopForegroundServiceWorker() {
  notifee.stopForegroundService().then(() => {
    console.log('Stopped FGS.');
  })
}

export async function startForegroundServiceWorker() {
  await notifee.displayNotification({
    title: 'Foreground service',
    body: 'This notification will exist for the lifetime of the service runner',
    android: {
      channelId: serviceChannel.id,
      asForegroundService: true,
      color: AndroidColor.RED,
      colorized: true,
      pressAction: {
        id: 'default',
      },
    },
  });
}