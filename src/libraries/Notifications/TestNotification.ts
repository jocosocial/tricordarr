import notifee from '@notifee/react-native';
import {callsChannel, serviceChannel} from './Channels';
import {PressAction} from '../Enums/Notifications';

/**
 * Generate a test notification.
 */
export async function displayTestNotification() {
  await notifee.displayNotification({
    id: 'abc123',
    title: 'Jonathan Coulton',
    body: "This was a triumph. I'm making a note here: HUGE SUCCESS. It's hard to overstate my satisfaction.",
    android: {
      channelId: callsChannel.id,
      // smallIcon: 'name-of-a-small-icon', // optional, defaults to 'ic_launcher'.
      autoCancel: false,
      // https://notifee.app/react-native/docs/android/interaction
      pressAction: {
        id: PressAction.default,
      },
      smallIcon: 'ic_notification',
    },
  });
}

/**
 * Cancel a test notification.
 */
export async function cancelTestNotification() {
  console.log('CANCELING AT return::onPress');
  await notifee.cancelNotification('abc123');
}
