import notifee from '@notifee/react-native';
import {buildWebSocket, WebSocketState, wsHealthcheck} from './Network/Websockets';
import {
  generateFgsShutdownNotification,
  generateForegroundServiceNotification,
} from './Notifications/ForegroundService';
import {fgsWorkerNotificationIDs} from './Enums/Notifications';
import {getAppConfig} from './AppConfig';
import {generatePushFromEvent} from './Notifications/SocketNotification';
import ReconnectingWebSocket from 'reconnecting-websocket';

let sharedWebSocket: ReconnectingWebSocket | undefined;
let fgsWorkerTimer: number;

export const getSharedWebSocket = async () => sharedWebSocket;
const setSharedWebSocket = async (ws: ReconnectingWebSocket) => (sharedWebSocket = ws);

// @TODO kill or modify this
export let fgsFailedCounter = 0;

const fgsWorkerHealthcheck = async () => {
  console.log('[FGS] Healthcheck');
  const ws = await getSharedWebSocket();
  wsHealthcheck(ws);
  // if (fgsFailedCounter < 10) {
  //   await setupWebsocket();
  //   const passed = await wsHealthcheck();
  //   !passed ? (fgsFailedCounter += 1) : null;
  // } else {
  //   console.error(`WebSocket failed too many consecutive times (${fgsFailedCounter} of 10). Shutting down.`);
  //   await generateFgsShutdownNotification();
  //   await stopForegroundServiceWorker();
  // }
};

/**
 * Handler function for Notification Socket events in the context of the Foreground Service.
 * Generates push notifications from socket events.
 */
const fgsEventListener = (event: WebSocketMessageEvent) => {
  console.log('[FGS] responding to event', event);
  generatePushFromEvent(event);
};

const createFgsSocket = async () => {
  const existingSocket = await getSharedWebSocket();
  if (existingSocket && existingSocket.readyState === WebSocket.OPEN) {
    console.log('[FGS] socket exists and is open. Not creating another one.');
    return;
  }
  const newWs = await buildWebSocket();
  await setSharedWebSocket(newWs);
  console.log('[FGS] created new socket');
};

/**
 * The function that runs as the foreground service worker. No loops or anything, it just executes once
 * when the worker starts.
 */
const fgsWorker = async () => {
  console.log('[FGS] Worker is starting');
  const appConfig = await getAppConfig();
  await createFgsSocket();
  const ws = await getSharedWebSocket();
  console.log('Worker Socket', ws);
  fgsWorkerTimer = setInterval(fgsWorkerHealthcheck, appConfig.fgsWorkerHealthTimer);
  if (ws) {
    ws.addEventListener('message', fgsEventListener);
  } else {
    console.error('[FGS] socket was undefined?');
  }
};

/**
 * Notifee exposes an API to register a foreground service worker task that runs when the notification
 * has been triggered. Android 14 changes some of the laws around workers so this entire thing may be
 * changing in the future.
 */
export const registerFgsWorker = () => {
  console.log('[FGS] Registering worker');
  notifee.registerForegroundService(fgsWorker);
};

export async function stopForegroundServiceWorker() {
  console.log('Stopping FGS.');
  try {
    const ws = await getSharedWebSocket();
    if (ws) {
      console.log(`Closing websocket in state ${ws.readyState}`);
      ws.close();
    }
    await notifee.stopForegroundService();
    await notifee.cancelNotification(fgsWorkerNotificationIDs.worker);
    clearInterval(fgsWorkerTimer);
    console.log('Cleared fgsWorkerTimer with ID', fgsWorkerTimer);
    console.log('Stopped FGS.');
  } catch (error) {
    console.error('FGS stop error:', error);
  }
}

export async function startForegroundServiceWorker() {
  console.log('Starting FGS');
  const ws = await getSharedWebSocket();
  if (ws && ws.readyState === WebSocket.OPEN) {
    console.log('FGS worker assumed to be running since websocket is open');
    return;
  }
  console.log('The websocket is', ws);

  console.log('[FGS] generating start notification');
  await generateForegroundServiceNotification(
    'A background worker has been started to maintain a connection to the Twitarr server.',
  );
  // Reset the health counter
  fgsFailedCounter = 0;
}
