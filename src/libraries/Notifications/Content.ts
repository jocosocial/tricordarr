import notifee, {AndroidChannelGroup} from '@notifee/react-native';
import {PressAction} from '../Enums/Notifications';

export function generateContentNotification(
  id: string,
  title: string,
  body: string,
  channel: AndroidChannelGroup,
  type: string,
  url: string,
) {
  notifee
    .displayNotification({
      id: id,
      title: title,
      body: body,
      data: {type: type, url: url},
      android: {
        channelId: channel.id,
        // smallIcon: 'mail', // optional, defaults to 'ic_launcher'.
        autoCancel: true,
        // https://notifee.app/react-native/docs/android/interaction
        pressAction: {
          id: PressAction.twitarrTab,
        },
      },
    })
    .catch(e => {
      console.error(e);
    });
}
