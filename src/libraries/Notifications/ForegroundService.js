import notifee from '@notifee/react-native';
import {serviceChannel} from './Channels';
import {twitarrPrimaryColor} from '../../styles/Theme';

export const fgsNotificationID = 'FGSWorkerNotificationID';

export async function generateForegroundServiceNotification(body, color = twitarrPrimaryColor, onlyIfShowing = false) {
  let show = !onlyIfShowing;
  const displayedNotifications = await notifee.getDisplayedNotifications();
  displayedNotifications.map(entry => {
    console.log('lolol', entry.id);
    if (entry.id === 'FGSWorkerNotificationID') {
      // We are currently showing.
      if (onlyIfShowing) {
        show = true;
      }
    }
  });
  if (show) {
    await notifee.displayNotification({
      id: fgsNotificationID,
      title: 'Twitarr Server Connection',
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
}
