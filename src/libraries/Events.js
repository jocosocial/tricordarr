import notifee, {EventType} from "@notifee/react-native";

export async function setupBackgroundEventHandler() {
  console.log('Setting up background events handler');
  notifee.onBackgroundEvent(async ({type, detail}) => {
    const {notification, pressAction} = detail;

    console.log('WE GOT A BACKGROUND EVENT!');
    console.log(type);
    console.log(detail);
    console.log('END BACKGROUND EVENT');

    // Check if the user pressed the "Mark as read" action
    if (type === EventType.ACTION_PRESS && pressAction.id === 'mark-as-read') {
      // Do something
      // Remove the notification
      await notifee.cancelNotification(notification.id);
    }

    if (type === EventType.PRESS) {
      await notifee.cancelNotification(notification.id);
    }
  });
}

export async function setupForegroundEventHandler() {
  console.log('Setting up foreground events...');
  notifee.onForegroundEvent(async ({type, detail}) => {
    const {notification, pressAction} = detail;
    console.log('Caught Foreground Event!');
    console.log(type);
    console.log(detail);
    console.log('End Foreground Event.');
  });
}