import notifee, {AndroidAction, AndroidChannelGroup} from '@notifee/react-native';
import {markAsReadPressAction, PressAction, settingsPressAction} from '../Enums/Notifications';
import {PushNotificationConfig} from '../AppConfig';

export interface ContentNotificationCategory {
  title: string;
  disabled?: boolean;
  description?: string;
}

export type ContentNotificationCategories = {
  [key in keyof PushNotificationConfig]: ContentNotificationCategory;
};

export const contentNotificationCategories: ContentNotificationCategories = {
  announcement: {
    title: 'Announcements',
    description:
      'Ship-wide public messages from THO or the TwitarrTeam. These are used sparingly and usually contain important information.',
  },
  seamailUnreadMsg: {
    title: 'Seamails',
    description: 'New unread private chat messages sent to you from another user.',
  },
  fezUnreadMsg: {
    title: 'LFG Posts',
    description: "New unread chat public messages posted in an LFG you've joined or that you own.",
  },
  alertwordPost: {
    title: 'Forum Alert Words',
    description: 'New forum post was made containing one of your configured alert words.',
  },
  forumMention: {
    title: 'Forum Mentions',
    description: 'New forum post was made [@]mentioning you in the content.',
  },
  incomingPhoneCall: {
    title: 'Incoming Call',
    description: 'Incoming KrakenTalk hailing frequencies.',
  },
  phoneCallAnswered: {
    title: 'Call Answered',
    description: 'KrakenTalk hailing frequencies opened, possibly on another device.',
  },
  phoneCallEnded: {
    title: 'Call Ended',
    description: 'KrakenTalk hailing frequencies closed.',
  },
  followedEventStarting: {
    title: 'Followed Event Reminders',
    description: 'Reminder that a followed event is starting Soon™.',
  },
  personalEventStarting: {
    title: 'Personal Event Starting',
    description: 'Reminder that a personal event is starting Soon™.',
  },
  joinedLFGStarting: {
    title: 'Joined LFG Reminders',
    description: 'Reminder that a joined LFG is starting Soon™.',
  },
  moderatorForumMention: {
    title: 'Moderator Forum Mentions',
    description: 'Affects moderators only. New forum post was made [@]mentioning moderator.',
  },
  twitarrTeamForumMention: {
    title: 'TwitarrTeam Forum Mentions',
    description: 'Affects twitarrteam only. New forum post was made [@]mentioning twitarrteam.',
  },
  alertwordTwarrt: {
    title: 'Twarrt Alert Words',
    disabled: true,
  },
  twarrtMention: {
    title: 'Twarrt Mention',
    disabled: true,
  },
};

export async function generateContentNotification(
  id: string,
  title: string,
  body: string,
  channel: AndroidChannelGroup,
  type: string,
  url: string,
  pressActionID: string = PressAction.twitarrTab,
  autoCancel: boolean = false,
  ongoing: boolean = false,
  markAsReadUrl?: string,
) {
  console.log('[Content.ts] Displaying notification with pressID', pressActionID);

  let actions: AndroidAction[] = [settingsPressAction];
  if (markAsReadUrl) {
    actions = [markAsReadPressAction, ...actions];
  }

  const data = {
    type: type,
    url: url,
    ...(markAsReadUrl ? {markAsReadUrl: markAsReadUrl} : undefined),
  };

  await notifee.displayNotification({
    id: id,
    title: title,
    body: body,
    data: data,
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
