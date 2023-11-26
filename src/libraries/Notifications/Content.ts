import notifee, {AndroidChannelGroup} from '@notifee/react-native';
import {PressAction} from '../Enums/Notifications';
import {PushNotificationConfig} from '../AppConfig';

interface ContentNotificationCategory {
  configKey: keyof PushNotificationConfig;
  title: string;
  disabled?: boolean;
  description?: string;
}

export const contentNotificationCategories: ContentNotificationCategory[] = [
  {
    configKey: 'announcement',
    title: 'Announcements',
    description:
      'Ship-wide public messages from THO or the TwitarrTeam. These are used sparingly and usually contain important information.',
  },
  {
    configKey: 'seamailUnreadMsg',
    title: 'Seamails',
    description: 'New unread private chat messages sent to you from another user.',
  },
  {
    configKey: 'fezUnreadMsg',
    title: 'LFG Posts',
    description: "New unread chat public messages posted in an LFG you've joined or that you own.",
  },
  {
    configKey: 'alertwordPost',
    title: 'Forum Alert Words',
    description: 'New forum post was made containing one of your configured alert words.',
  },
  {
    configKey: 'forumMention',
    title: 'Forum Mentions',
    description: 'New forum post was made [@]mentioning you in the content.',
  },
  {
    configKey: 'followedEventStarting',
    title: 'Event Reminders',
    disabled: true,
    description: 'Reminder that a followed event is starting SoonTM. At this time this feature is not available.',
  },
];

export function generateContentNotification(
  id: string,
  title: string,
  body: string,
  channel: AndroidChannelGroup,
  type: string,
  url: string,
  pressActionID: string = PressAction.twitarrTab,
) {
  console.log('Displaying notification with pressID', pressActionID);
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
          id: pressActionID,
        },
      },
    })
    .catch(e => {
      console.error(e);
    });
}
