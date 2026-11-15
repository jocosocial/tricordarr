import {flushSessionWrites} from '#src/Context/State/SessionStore';
import {stopAndroidPushService, syncAndroidPushService} from '#src/Libraries/Notifications/Push/Android/PushService';
import {clearLocalPushManager, startLocalPushManager} from '#src/Libraries/Notifications/Push/IOS/LocalPushManager';
import {isIOS} from '#src/Libraries/Platform/Detection';

/**
 * Bring background notifications up for the accounts that should have them. iOS runs one socket,
 * for the active account. Android runs one per account in a single service, and this is also how
 * that service learns about a changed account list, so it is safe (and expected) to call again.
 */
export const startPushProvider = async () => {
  // The providers resolve the accounts from storage (LAST_SESSION_ID); let a just-dispatched switch land first.
  await flushSessionWrites();
  if (isIOS) {
    await startLocalPushManager();
  } else {
    await syncAndroidPushService();
  }
};

/**
 * Turn background notifications off for every account on the device.
 */
export const stopPushProvider = async () => {
  if (isIOS) {
    clearLocalPushManager();
  } else {
    await stopAndroidPushService();
  }
};

/**
 * Called before the session changes (switch, sign in, sign out, remove). The iOS provider holds
 * one account's socket and must drop it before another account takes over. The Android service is
 * keyed by account and outlives the switch: the next `startPushProvider` reconciles it, and until
 * then the accounts it serves keep getting their notifications.
 */
export const releasePushProviderForSessionChange = async () => {
  if (isIOS) {
    clearLocalPushManager();
  }
};
