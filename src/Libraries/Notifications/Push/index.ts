import {flushSessionWrites} from '#src/Context/State/SessionStore';
import {
  startForegroundServiceWorker,
  stopForegroundServiceWorker,
} from '#src/Libraries/Notifications/Push/Android/ForegroundService';
import {clearLocalPushManager, startLocalPushManager} from '#src/Libraries/Notifications/Push/IOS/LocalPushManager';
import {isIOS} from '#src/Libraries/Platform/Detection';

export const startPushProvider = async () => {
  // The providers resolve the account from storage (LAST_SESSION_ID); let a just-dispatched switch land first.
  await flushSessionWrites();
  if (isIOS) {
    await startLocalPushManager();
  } else {
    await startForegroundServiceWorker();
  }
};
export const stopPushProvider = async () => {
  if (isIOS) {
    clearLocalPushManager();
  } else {
    await stopForegroundServiceWorker();
  }
};
