import notifee, {AndroidColor} from '@notifee/react-native';
import {serviceChannel} from "../notifications/Channels";

export function generateContentNotification(id, title, body, channel) {
  notifee
    .displayNotification({
      id: id,
      title: title,
      body: body,
      android: {
        channelId: channel.id,
        // smallIcon: 'mail', // optional, defaults to 'ic_launcher'.
        autoCancel: true,
        // https://notifee.app/react-native/docs/android/interaction
        pressAction: {
          id: 'default',
        },
      },
    })
    .catch(e => {
      console.error(e);
    });
}

export async function generateForegroundServiceNotification(body, color = AndroidColor.GRAY) {
  await notifee.displayNotification({
    id: 'FGSWorkerNotificationID',
    title: 'Foreground service',
    body: body,
    android: {
      channelId: serviceChannel.id,
      asForegroundService: true,
      color: color,
      colorized: true,
      pressAction: {
        id: 'default',
      },
    },
  });
}