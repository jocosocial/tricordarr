import notifee from '@notifee/react-native';
import {setupWebsocket, getSharedWebSocket} from './Network/Websockets';
import {fgsNotificationID, generateForegroundServiceNotification} from './Notifications/ForegroundService';

// let fgsWorkerTimer;

// https://javascript.info/websocket
async function fgsWorker() {
  console.log('FGS Worker is starting');
  setupWebsocket().catch(e => {
    console.error('FGS Websocket error:', e);
  });
  console.log('FGS Worker startup has finished');
}

export function registerForegroundServiceWorker() {
  console.log('Registering Foreground Service Worker');
  notifee.registerForegroundService(() => {
    return new Promise(fgsWorker);
  });
}

export async function stopForegroundServiceWorker() {
  console.log('Stopping FGS.');
  try {
    const ws = await getSharedWebSocket();
    if (ws) {
      console.log('Closing websocket', ws);
      // ws.close(1000, 'FGS was stopped.');
      ws.close();
    }
    await notifee.stopForegroundService();
    await notifee.cancelNotification(fgsNotificationID);
    console.log('Stopped FGS.');
  } catch (error) {
    console.error('FGS stop error:', error);
  }
}

export async function startForegroundServiceWorker() {
  console.log('Starting FGS');
  // If the notification is showing then we can assume the FGS Worker is active.
  // This is currently duplicated with generateForegroundServiceNotification()
  // because I don't know the future of that function and if it still needs to.
  let isFgsNotificationShowing = false;
  const displayedNotifications = await notifee.getDisplayedNotifications();
  displayedNotifications.map(entry => {
    if (entry.id === 'FGSWorkerNotificationID') {
      isFgsNotificationShowing = true;
    }
  });
  if (isFgsNotificationShowing) {
    console.log('FGS worker assumed to be running since notification still active');
    return;
  }

  try {
    const ws = await getSharedWebSocket();
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log('FGS worker assumed to be running since websocket is open');
      return;
    }
  } catch (error) {
    console.warn('couldnt get shared websocket', error);
  }

  await generateForegroundServiceNotification(
    'A background worker has been started to maintain a connection to the Twitarr server.',
  );
}
