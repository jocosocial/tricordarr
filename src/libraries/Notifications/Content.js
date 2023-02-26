import notifee from '@notifee/react-native';

export function generateContentNotification(id, title, body, channel, type, url) {
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
          id: 'default',
        },
      },
    })
    .catch(e => {
      console.error(e);
    });
}
