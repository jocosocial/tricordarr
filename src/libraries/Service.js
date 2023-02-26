import notifee from '@notifee/react-native';
import {setupWebsocket, getSharedWebSocket} from './Network/Websockets';
import {fgsNotificationID, generateForegroundServiceNotification} from './Notifications/ForegroundService';

// let fgsWorkerTimer;

// https://javascript.info/websocket
async function fgsWorker() {
  console.log('Foreground Service is starting');
  setupWebsocket().catch(e => {
    console.error('FGS Websocket error:', e);
  });
  console.log('Foreground Service startup has finished');
  // fgsWorkerTimer = setInterval(async () => {
  //   console.log('Updating status');
  //   const ws = await getSharedWebSocket();
  //   let message = 'Server connection ERROR!';
  //   let color = AndroidColor.RED;
  //   if (ws && ws.readyState === WebSocket.OPEN) {
  //     message = 'Server connection healthy!';
  //     color = AndroidColor.GREEN;
  //   }
  //   console.log(message);
  //   await generateForegroundServiceNotification(message, color, true);
  // }, 10000);
}

export function registerForegroundServiceWorker() {
  console.log('Registering Foreground Service Worker');
  notifee.registerForegroundService(() => {
    return new Promise(fgsWorker);
  });
}

export async function stopForegroundServiceWorker() {
  console.log('Stopping FGS.');
  notifee
    .stopForegroundService()
    .then(async () => {
      // clearInterval(fgsWorkerTimer);
      const ws = await getSharedWebSocket();
      if (ws) {
        ws.close(1000, 'FGS was stopped.');
      }
      console.log('Stopped FGS.');
    })
    .then(async () => {
      await notifee.cancelNotification(fgsNotificationID);
    })
    .catch(error => {
      console.error('Error during FGS stop', error);
    });
}

export async function startForegroundServiceWorker() {
  console.log('Starting FGS');
  await generateForegroundServiceNotification(
    'A background worker has been started to maintain a connection to the Twitarr server.',
  );
}
