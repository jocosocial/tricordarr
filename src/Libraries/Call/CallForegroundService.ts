import notifee, {AndroidCategory} from '@notifee/react-native';
import tinycolor from 'tinycolor2';

import {PressAction} from '#src/Enums/Notifications';
import {callsChannel} from '#src/Libraries/Notifications/Channels';
import {UserHeader} from '#src/Structs/ControllerStructs';
import {getTheme} from '#src/Styles/Theme';

export const callNotificationID = 'activeCallNotificationID';

const formatCallDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Display a foreground service notification for an active call on Android.
 * This ensures the call continues when the app is backgrounded.
 */
export async function showCallForegroundNotification(remoteUser: UserHeader, callDuration: number, isMuted: boolean) {
  const theme = getTheme();
  const durationText = formatCallDuration(callDuration);
  const mutedText = isMuted ? ' (Muted)' : '';

  await notifee.displayNotification({
    id: callNotificationID,
    title: `Call with ${remoteUser.username}`,
    body: `Duration: ${durationText}${mutedText}`,
    android: {
      channelId: callsChannel.id,
      asForegroundService: true,
      color: tinycolor(theme.colors.twitarrPrimary).toHexString(),
      colorized: true,
      pressAction: {
        id: PressAction.krakentalk,
      },
      ongoing: true,
      category: AndroidCategory.CALL,
      smallIcon: 'ic_notification',
      // Update notification every second to show current duration
      chronometerDirection: 'up',
    },
  });
}

/**
 * Update the call foreground notification with new duration and mute state.
 */
export async function updateCallForegroundNotification(remoteUser: UserHeader, callDuration: number, isMuted: boolean) {
  const theme = getTheme();
  const durationText = formatCallDuration(callDuration);
  const mutedText = isMuted ? ' (Muted)' : '';

  await notifee.displayNotification({
    id: callNotificationID,
    title: `Call with ${remoteUser.username}`,
    body: `Duration: ${durationText}${mutedText}`,
    android: {
      channelId: callsChannel.id,
      asForegroundService: true,
      color: tinycolor(theme.colors.twitarrPrimary).toHexString(),
      colorized: true,
      pressAction: {
        id: PressAction.krakentalk,
      },
      ongoing: true,
      category: AndroidCategory.CALL,
      smallIcon: 'ic_notification',
    },
  });
}

/**
 * Dismiss the call foreground notification when the call ends.
 */
export async function dismissCallForegroundNotification() {
  await notifee.cancelNotification(callNotificationID);
  await notifee.stopForegroundService();
}
