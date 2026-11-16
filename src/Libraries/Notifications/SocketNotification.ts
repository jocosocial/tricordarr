import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {MainStackComponents} from '#src/Navigation/Stacks/Main/MainStackComponents';
import {BottomTabComponents} from '#src/Navigation/Tabs/Bottom/BottomTabComponents';
import {NotificationTypeData} from '#src/Structs/SocketStructs';

export type NotificationEventDestination =
  {tab: BottomTabComponents; screen: string; params?: object} | {screen: keyof CommonStackParamList; params?: object};

/**
 * Where tapping content for a notification event should navigate (notification log, etc.).
 * Most destinations are Common Stack screens pushed on the caller's current stack so back
 * returns to the log. `tab` is set only when the destination is a tab root (announcement).
 * Returns undefined for types with no in-app destination (e.g. phone call lifecycle events).
 */
export const getNotificationEventDestination = (
  type: string,
  contentID: string,
): NotificationEventDestination | undefined => {
  switch (type as keyof typeof NotificationTypeData) {
    case NotificationTypeData.seamailUnreadMsg:
    case NotificationTypeData.addedToSeamail:
      return {screen: CommonStackComponents.seamailChatScreen, params: {fezID: contentID}};
    case NotificationTypeData.fezUnreadMsg:
      return {screen: CommonStackComponents.lfgChatScreen, params: {fezID: contentID}};
    case NotificationTypeData.announcement:
      // MainScreen is the home tab's own root screen, not a Common Stack screen, so this one
      // genuinely has to switch tabs.
      return {tab: BottomTabComponents.homeTab, screen: MainStackComponents.mainScreen};
    case NotificationTypeData.alertwordPost:
    case NotificationTypeData.twitarrTeamForumMention:
    case NotificationTypeData.moderatorForumMention:
      return {screen: CommonStackComponents.forumThreadPostScreen, params: {postID: contentID}};
    case NotificationTypeData.forumMention:
      return {screen: CommonStackComponents.forumPostMentionScreen};
    case NotificationTypeData.followedEventStarting:
      return {screen: CommonStackComponents.eventScreen, params: {eventID: contentID}};
    case NotificationTypeData.joinedLFGStarting:
    case NotificationTypeData.addedToLFG:
    case NotificationTypeData.lfgCanceled:
      return {screen: CommonStackComponents.lfgScreen, params: {fezID: contentID}};
    case NotificationTypeData.personalEventStarting:
    case NotificationTypeData.privateEventCanceled:
    case NotificationTypeData.addedToPrivateEvent:
      return {screen: CommonStackComponents.personalEventScreen, params: {eventID: contentID}};
    case NotificationTypeData.privateEventUnreadMsg:
      return {screen: CommonStackComponents.privateEventChatScreen, params: {fezID: contentID}};
    default:
      return undefined;
  }
};
