import {NotificationTypeData} from '#src/Structs/SocketStructs';

/**
 * User-facing title for a single notification event, matching the push notification title
 * where one is shown. Used by the notification log UI and by push generation.
 */
export const notificationEventTitles: Partial<Record<keyof typeof NotificationTypeData, string>> = {
  [NotificationTypeData.seamailUnreadMsg]: 'New Seamail',
  [NotificationTypeData.fezUnreadMsg]: 'New LFG Message',
  [NotificationTypeData.announcement]: 'Announcement',
  [NotificationTypeData.alertwordPost]: 'Forum Alert Word',
  [NotificationTypeData.forumMention]: 'Forum Mention',
  [NotificationTypeData.twitarrTeamForumMention]: 'TwitarrTeam Forum Mention',
  [NotificationTypeData.moderatorForumMention]: 'Moderator Forum Mention',
  [NotificationTypeData.incomingPhoneCall]: 'Incoming Call',
  [NotificationTypeData.phoneCallEnded]: 'Call Ended',
  [NotificationTypeData.followedEventStarting]: 'Followed Event Starting',
  [NotificationTypeData.joinedLFGStarting]: 'Joined LFG Starting',
  [NotificationTypeData.personalEventStarting]: 'Private Event Starting',
  [NotificationTypeData.addedToPrivateEvent]: 'Added to Private Event',
  [NotificationTypeData.addedToLFG]: 'Added to LFG',
  [NotificationTypeData.addedToSeamail]: 'Added to Seamail',
  [NotificationTypeData.privateEventCanceled]: 'Private Event Canceled',
  [NotificationTypeData.lfgCanceled]: 'LFG Canceled',
  [NotificationTypeData.privateEventUnreadMsg]: 'New Private Event Message',
};

/**
 * Returns the user-facing title for a notification log entry or filter row. Falls back to the
 * raw type string for unrecognized types (e.g. `unknown`).
 */
export const getNotificationTypeTitle = (type: string): string =>
  notificationEventTitles[type as keyof typeof NotificationTypeData] ?? type;
