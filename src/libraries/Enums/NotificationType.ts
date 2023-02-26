/**
 * A type of event that can change the value of the global notification handler's UserNotificationData result.
 * https://github.com/jocosocial/swiftarr/blob/master/Sources/App/Enumerations/NotificationType.swift
 */
export enum NotificationType {
  announcement = 'announcement',
  seamailUnreadMsg = 'seamailUnreadMsg',
  fezUnreadMsg = 'fezUnreadMsg',
  alertwordTwarrt = 'alertwordTwarrt',
  alertwordPost = 'alertwordPost',
  twarrtMention = 'twarrtMention',
  forumMention = 'forumMention',
  nextFollowedEventTime = 'nextFollowedEventTime',
}
