import notifee, {EventType, AndroidColor, AuthorizationStatus} from '@notifee/react-native';
import {serviceChannel, seamailChannel} from './Channels';

// Bootstrap sequence function
export async function bootstrap() {
  console.log('BOOTSTRAPPING');
  const initialNotification = await notifee.getInitialNotification();

  if (initialNotification) {
    console.log('Notification caused application to open', initialNotification.notification);
    console.log('Press action used to open the app', initialNotification.pressAction);
    console.log('CANCELING AT bootstrap::initialNotification');
    await cancel(initialNotification.notification.id);
  }
}

export async function cancel(notificationId) {
  await notifee.cancelNotification(notificationId);
}

export async function checkNotificationPermission() {
  const settings = await notifee.getNotificationSettings();

  if (settings.authorizationStatus === AuthorizationStatus.AUTHORIZED) {
    console.log('Notification permissions has been authorized');
  } else if (settings.authorizationStatus === AuthorizationStatus.DENIED) {
    console.log('Notification permissions has been denied');
  }
}

export async function enableNotifications() {
  console.log('Enabling notifications');
  notifee.openNotificationSettings().then(() => {
    console.log('Done enabling notifications');
  });
}
