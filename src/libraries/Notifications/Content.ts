import notifee, {AndroidAction, AndroidChannelGroup} from '@notifee/react-native';
import {markAsReadPressAction, PressAction, settingsPressAction} from '../Enums/Notifications';
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
    configKey: 'incomingPhoneCall',
    title: 'Incoming Call',
    description: 'Incoming KrakenTalk hailing frequencies.',
  },
  {
    configKey: 'phoneCallAnswered',
    title: 'Call Answered',
    description: 'KrakenTalk hailing frequencies opened, possibly on another device.',
  },
  {
    configKey: 'phoneCallEnded',
    title: 'Call Ended',
    description: 'KrakenTalk hailing frequencies closed.',
  },
  {
    configKey: 'followedEventStarting',
    title: 'Followed Event Reminders',
    description: 'Reminder that a followed event is starting Soon™.',
  },
  {
    configKey: 'personalEventStarting',
    title: 'Personal Event Starting',
    description: 'Reminder that a personal event is starting Soon™.',
  },
  {
    configKey: 'joinedLFGStarting',
    title: 'Joined LFG Reminders',
    description: 'Reminder that a joined LFG is starting Soon™.',
  },
  {
    configKey: 'moderatorForumMention',
    title: 'Moderator Forum Mentions',
    description: 'Affects moderators only. New forum post was made [@]mentioning moderator.',
  },
  {
    configKey: 'twitarrTeamForumMention',
    title: 'TwitarrTeam Forum Mentions',
    description: 'Affects twitarrteam only. New forum post was made [@]mentioning twitarrteam.',
  },
];

export async function generateContentNotification(
  id: string,
  title: string,
  body: string,
  channel: AndroidChannelGroup,
  type: string,
  url: string,
  pressActionID: string = PressAction.twitarrTab,
  autoCancel: boolean = true,
  ongoing: boolean = false,
  enableMarkAsRead: boolean = false,
) {
  console.log('Displaying notification with pressID', pressActionID);

  let actions: AndroidAction[] = [settingsPressAction];
  if (enableMarkAsRead) {
    actions = [markAsReadPressAction, ...actions];
  }

  await notifee.displayNotification({
    id: id,
    title: title,
    body: body,
    data: {type: type, url: url},
    android: {
      ongoing: ongoing,
      channelId: channel.id,
      // smallIcon: 'mail', // optional, defaults to 'ic_launcher'.
      autoCancel: autoCancel,
      // https://notifee.app/react-native/docs/android/interaction
      pressAction: {
        id: pressActionID,
      },
      smallIcon: 'ic_notification',
      actions: actions,
    },
  });
}
