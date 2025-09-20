import notifee from '@notifee/react-native';

/**
 * Sometimes the app is launched from a notification (like if the user pressed one or an action on one).
 * Grab that notification and do exactly nothing with it other than cancel it.
 */
export async function setupInitialNotification() {
  console.log('[InitialNotification.ts] Processing initial launch notification (if any).');
  const initialNotification = await notifee.getInitialNotification();

  if (initialNotification) {
    console.log('[InitialNotification.ts] Notification caused application to open', initialNotification.notification);
    console.log('[InitialNotification.ts] Press action used to open the app', initialNotification.pressAction);
    if (initialNotification.notification.id != null) {
      console.log('[InitialNotification.ts] Canceling initial notification', initialNotification.notification.id);
      await notifee.cancelNotification(initialNotification.notification.id);
    }
  }
}
