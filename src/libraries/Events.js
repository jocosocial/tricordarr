import notifee, {EventType} from "@notifee/react-native";
import {Linking} from 'react-native';
import {AppSettings} from "./AppSettings";
import {NotificationType} from './Enums/NotificationType';

export async function setupBackgroundEventHandler() {
  notifee.onBackgroundEvent(async ({type, detail}) => {
    const {notification, pressAction} = detail;
    await handleEvent(type, notification, pressAction);
  });
}

export async function setupForegroundEventHandler() {
  notifee.onForegroundEvent(async ({type, detail}) => {
    const {notification, pressAction} = detail;
    await handleEvent(type, notification, pressAction);
  });
}

async function handleEvent(type, notification, pressAction) {
  console.log("BEGIN HANDLING EVENT");
  // Check if the user pressed the "Mark as read" action
  if (type === EventType.ACTION_PRESS && pressAction.id === 'mark-as-read') {
    // Do something
    // Remove the notification
    console.log("HANDLE EVENT: MARK AS READ");
    notifee.cancelNotification(notification.id);
  }

  if (type === EventType.PRESS) {
    console.log("HANDLE EVENT: PRESS");
    notifee.cancelNotification(notification.id);

    let url = await AppSettings.SERVER_URL.getValue();

    // Only build URLs for handled types
    switch (notification.data.type) {
      case NotificationType.seamailUnreadMsg:
        url += notification.data.url;
        break;
    }

    await Linking.openURL(url);
  }

  console.log("END HANDLING EVENT");
}