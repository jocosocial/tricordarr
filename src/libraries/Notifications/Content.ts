import notifee, {AndroidAction, AndroidChannelGroup} from '@notifee/react-native';
import {markAsReadPressAction, PressAction, settingsPressAction} from '../Enums/Notifications';
import {PushNotificationConfig} from '../AppConfig';
import {NotificationTypeData} from '../Structs/SocketStructs.ts';

export interface ContentNotificationCategory {
  title: string;
  disabled?: boolean;
  description?: string;
  configKey: keyof typeof NotificationTypeData;
}

export type ContentNotificationCategories = {
  [key in keyof PushNotificationConfig]: ContentNotificationCategory;
};

export const contentNotificationCategories: ContentNotificationCategories = {
  announcement: {
    configKey: 'announcement',
    title: 'Announcements',
    description:
      'Ship-wide public messages from THO or the TwitarrTeam. These are used sparingly and usually contain important information.',
  },
  seamailUnreadMsg: {
    configKey: 'seamailUnreadMsg',
    title: 'Seamails',
    description: 'New unread private chat messages sent to you from another user.',
  },
  fezUnreadMsg: {
    configKey: 'fezUnreadMsg',
    title: 'LFG Posts',
    description: "New unread chat public messages posted in an LFG you've joined or that you own.",
  },
  alertwordPost: {
    configKey: 'alertwordPost',
    title: 'Forum Alert Words',
    description: 'New forum post was made containing one of your configured alert words.',
  },
  forumMention: {
    configKey: 'forumMention',
    title: 'Forum Mentions',
    description: 'New forum post was made [@]mentioning you in the content.',
  },
  incomingPhoneCall: {
    configKey: 'incomingPhoneCall',
    title: 'Incoming Call',
    description: 'Incoming KrakenTalk hailing frequencies.',
  },
  phoneCallAnswered: {
    configKey: 'phoneCallAnswered',
    title: 'Call Answered',
    description: 'KrakenTalk hailing frequencies opened, possibly on another device.',
  },
  phoneCallEnded: {
    configKey: 'phoneCallEnded',
    title: 'Call Ended',
    description: 'KrakenTalk hailing frequencies closed.',
  },
  followedEventStarting: {
    configKey: 'followedEventStarting',
    title: 'Followed Event Reminders',
    description: 'Reminder that a followed event is starting Soon™.',
  },
  personalEventStarting: {
    configKey: 'personalEventStarting',
    title: 'Personal Event Starting',
    description: 'Reminder that a personal event is starting Soon™.',
  },
  joinedLFGStarting: {
    configKey: 'joinedLFGStarting',
    title: 'Joined LFG Reminders',
    description: 'Reminder that a joined LFG is starting Soon™.',
  },
  moderatorForumMention: {
    configKey: 'moderatorForumMention',
    title: 'Moderator Forum Mentions',
    description: 'Affects moderators only. New forum post was made [@]mentioning moderator.',
  },
  twitarrTeamForumMention: {
    configKey: 'twitarrTeamForumMention',
    title: 'TwitarrTeam Forum Mentions',
    description: 'Affects twitarrteam only. New forum post was made [@]mentioning twitarrteam.',
  },
  alertwordTwarrt: {
    configKey: 'alertwordTwarrt',
    title: 'Twarrt Alert Words',
    disabled: true,
  },
  twarrtMention: {
    configKey: 'twarrtMention',
    title: 'Twarrt Mention',
    disabled: true,
  },
  addedToSeamail: {
    configKey: 'addedToSeamail',
    title: 'Added To Seamail',
    description: 'You have been added to a Seamail conversation between other users.',
  },
  addedToLFG: {
    configKey: 'addedToLFG',
    title: 'Added To LFG',
    description: 'You have been added to an LFG chat conversation.',
  },
  addedToPrivateEvent: {
    configKey: 'addedToPrivateEvent',
    title: 'Added To Private Event',
    description: 'Added to a private calendar event created by another user.',
  },
  privateEventUnreadMsg: {
    configKey: 'privateEventUnreadMsg',
    title: 'Unread Private Event Message',
    description: 'Unread chat message in a private event conversation.',
  },
  microKaraokeSongReady: {
    configKey: 'microKaraokeSongReady',
    title: 'MicroKaraoke Song Ready',
    description: 'A new song has completed and is available to view.',
  },
  lfgCanceled: {
    configKey: 'lfgCanceled',
    title: 'LFG Canceled',
    description: "An LFG that you have joined has been canceled by it's creator",
  },
  privateEventCanceled: {
    configKey: 'privateEventCanceled',
    title: 'Private Event Canceled',
    description: "A Private Event that you have joined has been canceled by it's creator",
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
