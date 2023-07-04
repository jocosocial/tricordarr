import {UserHeader} from './ControllerStructs';
import {NotificationType} from '../Enums/Notifications';

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
  timestamp: Date;
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

export enum NotificationTypeData {
  /// A server-wide announcement has just been added.
  announcement = 'announcement',
  /// A participant in a Fez the user is a member of has posted a new message.
  fezUnreadMsg = 'fezUnreadMsg',
  /// A participant in a Seamail thread the user is a member of has posted a new message.
  seamailUnreadMsg = 'seamailUnreadMsg',
  /// A user has posted a Twarrt that contains a word this user has set as an alertword.
  alertwordTwarrt = 'alertwordTwarrt',
  /// A user has posted a Forum Post that contains a word this user has set as an alertword.
  alertwordPost = 'alertwordPost',
  /// A user has posted a Twarrt that @mentions this user.
  twarrtMention = 'twarrtMention',
  /// A user has posted a Forum Post that @mentions this user.
  forumMention = 'forumMention',
  /// An event the user is following is about to start. NOT CURRENTLY IMPLEMENTED. Plan is to add support for this as a bulk process that runs every 30 mins
  /// at :25 and :55, giving all users following an event about to start a notification 5 mins before the event start time.
  followedEventStarting = 'followedEventStarting',
  /// Someone is trying to call this user via KrakenTalk.
  incomingPhoneCall = 'incomingPhoneCall',
  /// The callee answered the call, possibly on another device.
  phoneCallAnswered = 'phoneCallAnswered',
  /// Caller hung up while phone was rining, or other party ended the call in progress, or callee declined
  phoneCallEnded = 'phoneCallEnded',
}

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
  /// For .incomingPhoneCall notifications, the caller.
  caller?: UserHeader;
  /// For .incomingPhoneCall notification,s the caller's IP addresses. May be nil, in which case the receiver opens a server socket instead.
  callerAddress?: PhoneSocketServerAddress;
}

export namespace SocketNotificationData {
  export const getType = (socketNotificationData: SocketNotificationData) =>
    Object.keys(socketNotificationData.type)[0] as keyof typeof NotificationType;
}

/**
 * Custom to Tricordarr. Store a healthcheck result.
 */
export interface SocketHealthcheckData {
  result: boolean;
  timestamp: Date;
}
