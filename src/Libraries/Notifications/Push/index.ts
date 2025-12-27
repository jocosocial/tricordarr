import {
  startForegroundServiceWorker,
  stopForegroundServiceWorker,
} from '#src/Libraries/Notifications/Push/Android/ForegroundService';
import {startLocalPushManager} from '#src/Libraries/Notifications/Push/IOS/LocalPushManager';
import {stopLocalPushManager} from '#src/Libraries/Notifications/Push/IOS/LocalPushManager';
import {isIOS} from '#src/Libraries/Platform/Detection';

export const startPushProvider = async () => {
  if (isIOS) {
    await startLocalPushManager();
  } else {
    await startForegroundServiceWorker();
  }
};
export const stopPushProvider = async () => {
  if (isIOS) {
    await stopLocalPushManager();
  } else {
    await stopForegroundServiceWorker();
  }
};
