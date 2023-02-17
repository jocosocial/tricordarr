import notifee, {
  EventType,
  AndroidColor,
  AuthorizationStatus,
} from '@notifee/react-native';
import {getLoginData} from '../libraries/Storage';
import {getAuthHeaders} from '../libraries/APIClient';
// import BackgroundFetch from "react-native-background-fetch";
// import useWebSocket from 'react-use-websocket';
import {defaultChannel} from './Channels';

console.log('Setting up background events...');
notifee.onBackgroundEvent(async ({type, detail}) => {
  const {notification, pressAction} = detail;

  console.log('WE GOT AN EVENT THING');
  console.log(type);
  console.log(detail);
  console.log('END EVENT THINGY');

  // Check if the user pressed the "Mark as read" action
  if (type === EventType.ACTION_PRESS && pressAction.id === 'mark-as-read') {
    // Update external API
    // await fetch(`https://my-api.com/chat/${notification.data.chatId}/read`, {
    //     method: 'POST',
    // });

    // Remove the notification
    await notifee.cancelNotification(notification.id);
  }

  if (type === EventType.PRESS) {
    await notifee.cancelNotification(notification.id);
  }
});

// export async function initBackgroundFetch() {
//   // BackgroundFetch event handler.
//   const onEvent = async (taskId) => {
//     console.log('[BackgroundFetch] task: ', taskId);
//     // Do your background work...
//     // await this.addEvent(taskId);
//     await onDisplayNotification()
//     // IMPORTANT:  You must signal to the OS that your task is complete.
//     BackgroundFetch.finish(taskId);
//   }
//
//   // Timeout callback is executed when your Task has exceeded its allowed running-time.
//   // You must stop what you're doing immediately BackgroundFetch.finish(taskId)
//   const onTimeout = async (taskId) => {
//     console.warn('[BackgroundFetch] TIMEOUT task: ', taskId);
//     BackgroundFetch.finish(taskId);
//   }
//
//   // Initialize BackgroundFetch only once when component mounts.
//   let status = await BackgroundFetch.configure({minimumFetchInterval: 15}, onEvent, onTimeout);
//
//   console.log('[BackgroundFetch] configure status: ', status);
// }

// Bootstrap sequence function
export async function bootstrap() {
  console.log('BOOTSTRAPPING');
  const initialNotification = await notifee.getInitialNotification();

  if (initialNotification) {
    console.log(
      'Notification caused application to open',
      initialNotification.notification,
    );
    console.log(
      'Press action used to open the app',
      initialNotification.pressAction,
    );
    // console.log("POOP")
    // console.log(initialNotification)
    // console.log("POOP")
    console.log('CANCELING AT bootstrap::initialNotification');
    await cancel(initialNotification.notification.id);
  }
}

export async function cancel(notificationId) {
  await notifee.cancelNotification(notificationId);
}
export async function doForegroundThingy() {
  notifee.registerForegroundService(notification => {
    return new Promise(async () => {
      // Long running task...
      console.log('Foreground Service');
      //         onTaskUpdate(task => {
      //           console.log("GOT A FOREGROUND TASK!")
      //           console.log(task)
      // //          if (task.complete) {
      // //              await notifee.stopForegroundService()
      // //          }
      //         });
      // @TODO none of this is working yet.
      console.log('Starting websocket shit');
      // https://javascript.info/websocket
      // const WS_URL = "ws://10.0.2.2:8080"
      // const WS_URL = "ws://columbia.boston.grantcohoe.com:8081/api/v3/notification/socket"
      // @TODO deal with ws vs wss
      const WS_URL = 'wss://beta.twitarr.com/api/v3/notification/socket';
      // useWebSocket(WS_URL, {
      //   onOpen: () => {
      //     console.log('WebSocket connection established.');
      //   }
      // });
      const loginData = await getLoginData();
      const authHeaders = getAuthHeaders(undefined, undefined, loginData.token);
      let socket = new WebSocket(WS_URL, null, {
        headers: authHeaders,
      });

      socket.onopen = function (e) {
        console.log('[open] Connection established');
        console.log('Sending to server');
        socket.send('PING');
      };

      socket.onmessage = function (event) {
        console.log(`[message] Data received from server: ${event.data}`);
        const notificationData = JSON.parse(event.data);
        console.log(notificationData);
        notifee.displayNotification({
          id: notificationData.contentID,
          title: 'New Seamail Message',
          body: notificationData.info,
          android: {
            channelId,
            // smallIcon: 'mail', // optional, defaults to 'ic_launcher'.
            autoCancel: true,
            // https://notifee.app/react-native/docs/android/interaction
            pressAction: {
              id: 'default',
            },
          },
        });
      };

      socket.onclose = function (event) {
        if (event.wasClean) {
          console.log(
            `[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`,
          );
        } else {
          // e.g. server process killed or network down
          // event.code is usually 1006 in this case
          console.log('[close] Connection died');
        }
      };

      socket.onerror = function (error) {
        console.log('[error] ', error);
      };
    });
  });
  // const channelId = await notifee.createChannel({
  //   id: 'default',
  //   name: 'Default Channel',
  // });

  await notifee.displayNotification({
    title: 'Foreground service',
    body: 'This notification will exist for the lifetime of the service runner',
    android: {
      channelId: defaultChannel.id,
      asForegroundService: true,
      color: AndroidColor.RED,
      colorized: true,
      pressAction: {
        id: 'default',
      },
    },
  });
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
  await notifee.openNotificationSettings();
}
