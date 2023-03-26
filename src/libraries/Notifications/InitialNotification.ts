import notifee from '@notifee/react-native';

// Bootstrap sequence function
export async function setupInitialNotification() {
  console.log('BOOTSTRAPPING');
  const initialNotification = await notifee.getInitialNotification();

  if (initialNotification) {
    console.log('Notification caused application to open', initialNotification.notification);
    console.log('Press action used to open the app', initialNotification.pressAction);
    console.log('CANCELING AT bootstrap::initialNotification');
    if (initialNotification.notification.id != null) {
      await notifee.cancelNotification(initialNotification.notification.id);
    }
  }
}
