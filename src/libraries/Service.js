import {getLoginData} from './Storage';
import {getAuthHeaders} from './APIClient';
import notifee, {AndroidColor} from '@notifee/react-native';
import {seamailChannel, serviceChannel} from '../notifications/Channels';
import {AppSettings} from './AppSettings';
import {setupWebsocket} from './Websockets';

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
  setupWebsocket(wsUrl, {headers: authHeaders});
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
  });
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
