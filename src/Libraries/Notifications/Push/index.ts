import {flushSessionWrites} from '#src/Context/State/SessionStore';
import {startAndroidPushService, stopAndroidPushService} from '#src/Libraries/Notifications/Push/Android/PushService';
import {clearLocalPushManager, startLocalPushManager} from '#src/Libraries/Notifications/Push/IOS/LocalPushManager';
import {isIOS} from '#src/Libraries/Platform/Detection';

export const startPushProvider = async () => {
  // The providers resolve the account from storage (LAST_SESSION_ID); let a just-dispatched switch land first.
  await flushSessionWrites();
  if (isIOS) {
    await startLocalPushManager();
  } else {
    await startAndroidPushService();
  }
};
export const stopPushProvider = async () => {
  if (isIOS) {
    clearLocalPushManager();
  } else {
    await stopAndroidPushService();
  }
};
