/**
 * A type of event that can change the value of the global notification handler's UserNotificationData result.
 * https://github.com/jocosocial/swiftarr/blob/master/Sources/App/Enumerations/NotificationType.swift
 * @deprecated
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

export enum fgsWorkerNotificationIDs {
  worker = 'fgsWorkerNotificationID',
  shutdown = 'fgsShutdownNotificationID',
}

export enum PressAction {
  default = 'default',
  twitarrTab = 'twitarrTab',
  worker = 'worker',
  seamail = 'seamail',
}
