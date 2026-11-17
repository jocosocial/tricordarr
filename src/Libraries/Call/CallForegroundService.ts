import {createLogger} from '#src/Libraries/Logger';
import {UserHeader} from '#src/Structs/ControllerStructs';

import NativeTricordarrModule from '#specs/NativeTricordarrModule';

const logger = createLogger('CallForegroundService.ts');

/**
 * Show the ongoing notification for an active call on Android, in a foreground service so the call
 * continues when the app is backgrounded. Calling it again updates the notification, for a change
 * in mute state. The system counts the call duration from [startTime].
 */
export function showCallForegroundNotification(remoteUser: UserHeader, startTime: Date, isMuted: boolean) {
  try {
    NativeTricordarrModule.showCallNotification(remoteUser.username, startTime.getTime(), isMuted);
  } catch (error) {
    logger.error('Failed to show call foreground notification', error);
  }
}

/**
 * Dismiss the call foreground notification and stop its service when the call ends.
 */
export function dismissCallForegroundNotification() {
  try {
    NativeTricordarrModule.dismissCallNotification();
  } catch (error) {
    logger.error('Failed to dismiss call foreground notification', error);
  }
}
