import {UserHeader} from '#src/Structs/ControllerStructs';
import {NotificationTypeData} from '#src/Structs/NotificationEvents.generated';

export interface SocketFezPostData {
  /// PostID of the new post
  postID: number;
  /// User that posted. Should be a current member of the fez; socket should get a `SocketMemberChangeData` adding a new user before any posts by that user.
  /// But, there's a possible race condition where membership could change before the socket is opened. Unless you update FezData after opening the socket, you may
  /// see posts from users that don't appear to be members of the fez.
  author: UserHeader;
  /// The text of this post.
  text: string;
  /// When the post was made.
  timestamp: string;
  /// An optional image that may be attached to the post.
  image?: string;
  /// HTML fragment for the post, using the Swiftarr Web UI's front end. Fragment is built using the same semantic data available in the other fields in this struct.
  /// Please don't try parsing this to gather data. This field is here so the Javascript can insert HTML that matches what the HTTP endpoints render.
  html?: string;
}

export interface SocketFezMemberChangeData {
  /// The user that joined/left.
  user: UserHeader;
  /// TRUE if this is a join.
  joined: boolean;
  /// HTML fragment for the action, using the Swiftarr Web UI's front end. Fragment is built using the same semantic data available in the other fields in this struct.
  /// Please don't try parsing this to gather data. This field is here so the Javascript can insert HTML that matches what the HTTP endpoints render.
  html?: string;
}

// Generated from specs/NotificationEvents.json; re-exported so existing imports keep working.
export {NotificationTypeData};

export interface PhoneSocketServerAddress {
  ipV4Addr?: string;
  ipV6Addr?: string;
}

/**
 * Socket Notification Data.
 * type is funky because it's Content. NotificationTypeData. See namespace SocketNotificationData below.
 */
export interface SocketNotificationData {
  /// The type of event that happened. See `SocketNotificationData.NotificationTypeData` for values.
  type: {[key: string]: {}};
  /// A string describing what happened, suitable for adding to a notification alert.
  info: string;
  /// An ID of an Announcement, Fez, Twarrt, ForumPost, or Event.
  contentID: string;
  /// An ID of a related parent object, when one exists. For forum mention and alertword post notifications this is the Forum ID.
  secondaryContentID?: string;
  /// For .incomingPhoneCall notifications, the caller.
  caller?: UserHeader;
  /// For .incomingPhoneCall notification,s the caller's IP addresses. May be nil, in which case the receiver opens a server socket instead.
  callerAddress?: PhoneSocketServerAddress;
}

export namespace SocketNotificationData {
  export const getType = (socketNotificationData: SocketNotificationData) =>
    Object.keys(socketNotificationData.type)[0] as `${NotificationTypeData}`;
}

/**
 * Custom to Tricordarr. Health of one account's background notification socket, as reported by
 * the native side (Android's TwitarrPushService, or iOS's LocalPushExtension socket).
 * `failedCount` and `startedAt` are Android-only today. Timestamps are epoch milliseconds.
 */
export interface PerAccountStatus {
  accountID: string;
  state?: string;
  lastHealthcheckAt?: number;
  lastHealthcheckSuccess?: boolean;
  failedCount?: number;
  startedAt?: number;
  lastError?: string;
  lastErrorAt?: number;
}
