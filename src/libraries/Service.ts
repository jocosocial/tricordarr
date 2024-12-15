import notifee from '@notifee/react-native';
import {buildWebSocket, wsHealthcheck} from './Network/Websockets';
import {
  generateFgsShutdownNotification,
  generateForegroundServiceNotification,
} from './Notifications/ForegroundService';
import {fgsWorkerNotificationIDs} from './Enums/Notifications';
import {getAppConfig} from './AppConfig';
import {generatePushNotificationFromEvent} from './Notifications/SocketNotification';
import ReconnectingWebSocket from 'reconnecting-websocket';
import {SocketHealthcheckData} from './Structs/SocketStructs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StorageKeys} from './Storage';
import {check as checkPermission, PERMISSIONS, RESULTS} from 'react-native-permissions';

let sharedWebSocket: ReconnectingWebSocket | undefined;
let fgsWorkerTimer: NodeJS.Timeout;

export const getSharedWebSocket = async () => sharedWebSocket;
const setSharedWebSocket = async (ws: ReconnectingWebSocket) => (sharedWebSocket = ws);

// @TODO kill or modify this
export let fgsFailedCounter = 0;
export let fgsFailedThreshold = 10;

/**
 * Healthcheck driver function. Perform the healthcheck, store the result,
 * and maybe shutdown if we've failed too many times.
 */
const fgsWorkerHealthcheck = async () => {
  console.log('[Service.ts] Performing WebSocket Healthcheck');
  const ws = await getSharedWebSocket();
  const healthcheckResult: SocketHealthcheckData = {
    result: wsHealthcheck(ws),
    timestamp: new Date().toISOString(),
  };

  // Store the healthcheck data
  await AsyncStorage.setItem(StorageKeys.WS_HEALTHCHECK_DATA, JSON.stringify(healthcheckResult));
  if (healthcheckResult.result) {
    fgsFailedCounter = 0;
  } else {
    fgsFailedCounter += 1;
  }

  // If we've failed too many times, shut down.
  if (fgsFailedCounter >= fgsFailedThreshold) {
    console.error(
      `[Service.ts] WebSocket failed too many consecutive times (${fgsFailedCounter} of ${fgsFailedThreshold}). Shutting down.`,
    );
    await generateFgsShutdownNotification();
    await stopForegroundServiceWorker();
  }
};

/**
 * Handler function for Notification Socket events in the context of the Foreground Service.
 * Generates push notifications from socket events.
 */
const fgsEventHandler = (event: WebSocketMessageEvent) => {
  console.log('[Service.ts] responding to event', event);
  generatePushNotificationFromEvent(event).catch(console.error);
};

/**
 * Establish a new or return an existing WebSocket for use with push notifications.
 */
const createSharedWebSocket = async () => {
  const existingSocket = await getSharedWebSocket();
  if (existingSocket && existingSocket.readyState === WebSocket.OPEN) {
    console.log('[Service.ts] Socket already exists and is open!');
    return existingSocket;
  }
  const newWs = await buildWebSocket();
  await setSharedWebSocket(newWs);
  console.log('[Service.ts] Created new socket.');
  return newWs;
};

/**
 * The function that runs as the foreground service worker. No loops or anything, it just executes once
 * when the worker starts.
 */
const fgsWorker = async () => {
  console.log('[Service.ts] Worker is starting');

  const appConfig = await getAppConfig();
  if (!appConfig.enableNotificationSocket) {
    console.log('[Service.ts] notification socket not enabled in app config. Shutting down.');
    // I've thought about generating a notification for when the worker shuts down, but this
    // would trigger every time the worker "shut down" explicitly or implicitly which is not
    // desirable behavior. For debugging the log message should be sufficient. Besides, any
    // "Start" buttons should be disabled if the socket is disabled.
    await stopForegroundServiceWorker();
    return;
  }

  // Add our event listener to respond to socket events and turn them into push notifications.
  const ws = await createSharedWebSocket();
  ws.addEventListener('message', fgsEventHandler);

  // Start a regular socket health check to help ensure the socket stays open.
  // Or at least yell at the user when it fails.
  fgsWorkerTimer = setInterval(fgsWorkerHealthcheck, appConfig.fgsWorkerHealthTimer);
  console.log('[Service.ts] Worker startup complete.');
};

/**
 * Notifee exposes an API to register a foreground service worker task that runs when the notification
 * has been triggered. Android 14 changes some of the laws around workers so this entire thing may be
 * changing in the future. This needs to return a new Promise(task), not just the task. I thought I
 * could get clever but that didn't work.
 * https://notifee.app/react-native/docs/android/foreground-service
 */
export const registerFgsWorker = () => {
  console.log('[Service.ts] Registering foreground service worker function.');
  notifee.registerForegroundService(() => {
    return new Promise(fgsWorker);
  });
};

/**
 * Stop the foreground service worker that was registered in App.tsx.
 */
export async function stopForegroundServiceWorker() {
  console.log('[Service.ts] Stopping foreground service worker.');
  try {
    const ws = await getSharedWebSocket();
    if (ws) {
      console.log(`[Service.ts] Closing websocket in state ${ws.readyState}`);
      ws.close();
    }
    await notifee.stopForegroundService();
    await notifee.cancelNotification(fgsWorkerNotificationIDs.worker);

    // Clear the healthcheck interval that was started.
    clearInterval(fgsWorkerTimer);
    console.log('[Service.ts] Cleared fgsWorkerTimer with ID', fgsWorkerTimer);

    // Done
    console.log('[Service.ts] Foreground service worker stopped.');
  } catch (error) {
    console.error('[Service.ts] Error stopping service:', error);
  }
}

/**
 * Start the foreground service worker that was registered in App.tsx.
 * For reasons, the only way we have to "start" the worker is to generate
 * a notification associated with the foreground service.
 * This function is called every time the app launches so it needs to be smart
 * about whether it generates a new notification.
 *
 * During testing, it seems that the app was able to start the WebSocket, not display the notification,
 * and leave the socket in the background as some sort of "foreground service task like thing". That is
 * to say it kept running after the app was killed. I suspect the OS would come along at some point
 * and terminate it. I believe the notification is the only way to ensure that it starts correctly.
 */
export async function startForegroundServiceWorker() {
  const notificationPermission = await checkPermission(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
  // Android 13 API Level 33 added POST_NOTIFICATIONS permission. Devices less than that return UNAVAILABLE.
  // We can safely assume that notifications are allowed and available if that is the case.
  if (notificationPermission !== RESULTS.UNAVAILABLE && notificationPermission !== RESULTS.GRANTED) {
    console.log('[Service.ts] Notification permission not allowed. Not starting FGS or socket.');
    return;
  }
  console.log('[Service.ts] Starting foreground service worker.');
  const ws = await getSharedWebSocket();

  // Reset the health counter
  fgsFailedCounter = 0;

  // Check if we should trigger the worker.
  if (ws && ws.readyState === WebSocket.OPEN) {
    console.log('[Service.ts] Worker assumed to be running since websocket is open.');
    return;
  }

  // This actually starts the worker. You should see a log message when the worker function
  // starts up (assuming the console.log is still in there).
  await AsyncStorage.setItem(StorageKeys.FGS_START, JSON.stringify(new Date().toISOString()));
  await generateForegroundServiceNotification();
}
