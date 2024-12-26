import {UserHeader} from './ControllerStructs';

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

export enum NotificationTypeData {
  // Notifies Everyone
  /// A server-wide announcement has just been added.
  announcement = 'announcement',

  // Added to Chat - only fires when someone else adds you to their chat
  // Note: I'm specifically not making notificaitons for "Removed From Chat" because: it can feel mean to receive that notification, and
  // there's nowhere for the notification to take the user.
  ///  Only for 'open' seamails. The owner of the chata has added this user.
  addedToSeamail = 'addedToSeamail',
  /// The creator of the LFG has added this user.
  addedToLFG = 'addedToLFG',
  /// The creator of the event has added this user.
  addedToPrivateEvent = 'addedToPrivateEvent',
  /// A Private Event the user has joined has been canceled.
  privateEventCanceled = 'privateEventCanceled',
  /// An LFG the user has joined has been canceled.
  lfgCanceled = 'lfgCanceled',

  // New Chat Messages
  /// A participant in a Chat the user is a member of has posted a new message.
  fezUnreadMsg = 'fezUnreadMsg',
  /// A participant in a Seamail thread the user is a member of has posted a new message.
  seamailUnreadMsg = 'seamailUnreadMsg',
  /// An invitee to a Private Event has posted a new chat message in the event's chat.
  privateEventUnreadMsg = 'privateEventUnreadMsg',

  // Starting Soon
  /// An event the user is following is about to start.
  followedEventStarting = 'followedEventStarting',
  /// An LFG the user has joined is about to start.
  joinedLFGStarting = 'joinedLFGStarting',
  /// A Personal Event the user has created or was added to is about to start.
  personalEventStarting = 'personalEventStarting',

  // @mentions and Alertwords
  /// A user has posted a Twarrt that contains a word this user has set as an alertword.
  alertwordTwarrt = 'alertwordTwarrt',
  /// A user has posted a Forum Post that contains a word this user has set as an alertword.
  alertwordPost = 'alertwordPost',
  /// A user has posted a Twarrt that @mentions this user.
  twarrtMention = 'twarrtMention',
  /// A user has posted a Forum Post that @mentions this user.
  forumMention = 'forumMention',

  // Phonecalls
  /// Someone is trying to call this user via KrakenTalk.'
  incomingPhoneCall = 'incomingPhoneCall',
  /// The callee answered the call, possibly on another device.
  phoneCallAnswered = 'phoneCallAnswered',
  /// Caller hung up while phone was rining, or other party ended the call in progress, or callee declined
  phoneCallEnded = 'phoneCallEnded',

  // Micro Karaoke
  /// A Micro Karaoke song the user contributed to is ready for viewing. .
  microKaraokeSongReady = 'microKaraokeSongReady',

  // Mod Stuff
  /// A new or edited forum post that now @mentions @moderator.
  moderatorForumMention = 'moderatorForumMention',
  /// A new or edited forum post that now @mentions @twitarrteam.
  twitarrTeamForumMention = 'twitarrTeamForumMention',
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
    Object.keys(socketNotificationData.type)[0] as keyof typeof NotificationTypeData;
}

/**
 * Custom to Tricordarr. Store a healthcheck result.
 */
export interface SocketHealthcheckData {
  result: boolean;
  timestamp: string;
}
