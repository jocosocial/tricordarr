import notifee from '@notifee/react-native';
import {serviceChannel} from './Channels';
import {cancel} from './index';

/**
 * Generate a test notification.
 */
export async function displayTestNotification() {
  await notifee.displayNotification({
    id: 'abc123',
    title: 'Jonathan Coulton',
    body: "This was a triumph. I'm making a note here: HUGE SUCCESS. It's hard to overstate my satisfaction.",
    android: {
      channelId: serviceChannel.id,
      // smallIcon: 'name-of-a-small-icon', // optional, defaults to 'ic_launcher'.
      autoCancel: false,
      // https://notifee.app/react-native/docs/android/interaction
      pressAction: {
        id: 'default',
      },
    },
  });
}

/**
 * Cancel a test notification.
 */
export function cancelTestNotification() {
  console.log('CANCELING AT return::onPress');
  cancel('abc123').catch(console.error);
}
