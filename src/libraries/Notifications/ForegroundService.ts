import notifee from '@notifee/react-native';
import {serviceChannel} from './Channels';
import {twitarrErrorColor, twitarrPrimaryColor} from '../../styles/Theme';
import {fgsWorkerNotificationIDs, PressAction} from '../Enums/Notifications';

export async function generateForegroundServiceNotification(
  body: string | undefined = 'A background worker has been started to maintain a connection to the Twitarr server.',
  color = twitarrPrimaryColor,
  onlyIfShowing = false,
) {
  // Kill a shutdown notification if we had one
  await notifee.cancelNotification(fgsWorkerNotificationIDs.shutdown);

  let show = !onlyIfShowing;
  const displayedNotifications = await notifee.getDisplayedNotifications();
  displayedNotifications.map(entry => {
    if (entry.id === fgsWorkerNotificationIDs.worker) {
      // We are currently showing.
      if (onlyIfShowing) {
        show = true;
      }
    }
  });
  if (show) {
    await notifee.displayNotification({
      id: fgsWorkerNotificationIDs.worker,
      title: 'Twitarr Server Connection',
      body: body,
      android: {
        channelId: serviceChannel.id,
        asForegroundService: true,
        color: color,
        colorized: true,
        pressAction: {
          id: PressAction.home,
        },
        actions: [
          {
            title: 'Settings',
            pressAction: {
              id: PressAction.worker,
            },
          },
        ],
        smallIcon: 'ic_notification',
      },
    });
  }
}

export async function generateFgsShutdownNotification() {
  const currentTime = new Date();
  const body = 'Relaunch the app to try again. Connection lost at ' + currentTime.toLocaleTimeString();
  await notifee.displayNotification({
    id: fgsWorkerNotificationIDs.shutdown,
    title: 'Twitarr Connection Lost',
    body: body,
    android: {
      channelId: serviceChannel.id,
      color: twitarrErrorColor,
      colorized: true,
      pressAction: {
        id: PressAction.worker,
      },
      smallIcon: 'ic_notification',
    },
  });
}
