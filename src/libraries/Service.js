import {getLoginData} from './Storage';
import {getAuthHeaders} from './APIClient';
import notifee, {AndroidColor} from '@notifee/react-native';
import {seamailChannel, serviceChannel} from '../notifications/Channels';
import {AppSettings} from './AppSettings';
import {setupWebsocket, getSharedWebSocket, setSharedWebSocket} from './Websockets';
import {generateForegroundServiceNotification} from "./Notifications";

// https://javascript.info/websocket
async function fgsWorker() {
  console.log('Foreground Service is starting');
  setupWebsocket().catch(e => {
    console.error('FGS Websocket error:', e);
  });
  console.log('Foreground Service startup has finished');
  // while (true) {
  //   setTimeout(() => console.log('healthcheck'), 1000);
  // }
  setInterval(async () => {
    console.log('Updating status');
    const ws = await getSharedWebSocket();
    let message = 'Server connection ERROR!';
    let color = AndroidColor.RED;
    if (ws && ws.readyState === WebSocket.OPEN) {
      message = 'Server connection healthy!';
      color = AndroidColor.GREEN;
    }
    console.log(message);
    await generateForegroundServiceNotification(message, color);
  }, 10000);
}

export function registerForegroundServiceWorker() {
  console.log('Registering Foreground Service Worker');
  notifee.registerForegroundService(() => {
    return new Promise(fgsWorker);
  });
}

export async function stopForegroundServiceWorker() {
  notifee.stopForegroundService().then(async () => {
    const ws = await getSharedWebSocket();
    if (ws) {
      ws.close(1000, 'FGS was stopped.');
    }
    console.log('Stopped FGS.');
  });
}

export async function startForegroundServiceWorker() {
  await generateForegroundServiceNotification('This notification will exist for the lifetime of the service runner');
}
