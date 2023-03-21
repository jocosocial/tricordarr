import {FezType} from '../Enums/FezType';

/**
 * All of these interfaces come from Swiftarr.
 * https://github.com/jocosocial/swiftarr/blob/master/Sources/App/Controllers/Structs/ControllerStructs.swift
 */
export interface TokenstringData {
  /// The user ID of the newly logged in user.
  userID: string;
  /// The user's access level.
  accessLevel: string;
  /// The token string.
  token: string;
}

export interface UserHeader {
  /// The user's ID.
  userID: string;
  /// The user's username.
  username: string;
  /// The user's displayName.
  displayName?: string;
  /// The user's avatar image.
  userImage?: string;
}

export interface ProfilePublicData {
  /// Basic info about the user--their ID, username, displayname, and avatar image.
  header: UserHeader;
  /// An optional real world name of the user.
  realName: string;
  /// An optional preferred pronoun or form of address.
  preferredPronoun: string;
  /// An optional home location for the user.
  homeLocation: string;
  /// An optional cabin number for the user.
  roomNumber: string;
  /// An optional email address for the user.
  email: string;
  /// An optional blurb about the user.
  about: string;
  /// An optional greeting/message to visitors of the profile.
  message: string;
  /// A UserNote owned by the visiting user, about the profile's user (see `UserNote`).
  note?: string;
}

export interface UserNotificationData {
  /// Always an ISO 8601 date in UTC, like "2020-03-07T12:00:00Z"
  serverTime: string;
  /// Server Time Zone offset, in seconds from UTC. One hour before UTC is -3600. EST  timezone is -18000.
  serverTimeOffset: number;
  /// Human-readable time zone name, like "EDT"
  serverTimeZone: string;
  /// Features that are turned off by the server. If the `appName` for a feature is `all`, the feature is disabled at the API layer.
  /// For all other appName values, the disable is just a notification that the client should not show the feature to users.
  /// If the list is empty, no features have been disabled.
  disabledFeatures: object[];
  /// The name of the shipboard Wifi network
  shipWifiSSID?: string;
  /// IDs of all active announcements
  activeAnnouncementIDs: number[];

  /// All fields below this line will be 0 or null if called when not logged in.

  /// Count of announcements the user has not yet seen. 0 if not logged in.
  newAnnouncementCount?: number;
  /// Number of twarrts that @mention the user. 0 if not logged in.
  twarrtMentionCount?: number;
  /// Number of twarrt @mentions that the user has not read (by visiting the twarrt mentions endpoint; reading twarrts in the regular feed doesn't count). 0 if not logged in.
  newTwarrtMentionCount?: number;
  /// Number of forum posts that @mention the user. 0 if not logged in.
  forumMentionCount?: number;
  /// Number of forum post @mentions the user has not read. 0 if not logged in.
  newForumMentionCount?: number;
  /// Count of # of Seamail threads with new messages. NOT total # of new messages-a single seamail thread with 10 new messages counts as 1. 0 if not logged in.
  newSeamailMessageCount?: number;
  /// Count of # of Fezzes with new messages. 0 if not logged in.
  newFezMessageCount?: number;
  /// The start time of the earliest event that the user has followed with a start time > now. nil if not logged in or no matching event.
  nextFollowedEventTime?: string;

  /// The event ID of the the next future event the user has followed. This event's start time should always be == nextFollowedEventTime.
  /// If the user has favorited multiple events that start at the same time, this will be random among them.
  nextFollowedEventID?: string;

  /// For each alertword the user has, this returns data on hit counts for that word.
  alertWords: object[];

  /// Will be nil for non-moderator accounts.
  moderatorData?: object;
}

export interface Paginator {
  /// The total number of items returnable by the request.
  total: number;
  /// The index number of the first item in the collection array, relative to the overall returnable results.
  start: number;
  /// The number of results requested. The collection array could be smaller than this number.
  limit: number;
}

export interface FezPostData {
  /// The ID of the fez post.
  postID: number;
  /// The fez post's author.
  author: UserHeader;
  /// The text content of the fez post.
  text: string;
  /// The time the post was submitted.
  timestamp: Date;
  /// The image content of the fez post.
  image?: string;
}

export interface MembersOnlyData {
  /// The users participating in the fez.
  participants: [UserHeader];
  /// The users on a waiting list for the fez.
  waitingList: [UserHeader];
  /// How many posts the user can see in the fez. The count is returned even for calls that don't return the actual posts, but is not returned for
  /// fezzes where the user is not a member. PostCount does not include posts from blocked/muted users.
  postCount: number;
  /// How many posts the user has read. If postCount > readCount, there's posts to be read. UI can also use readCount to set the initial view
  /// to the first unread message.ReadCount does not include posts from blocked/muted users.
  readCount: number;
  /// Paginates the array in posts--gives the start and limit of the returned posts array relative to all the posts in the thread.
  paginator: Paginator;
  /// The FezPosts in the fez discussion. Methods that return arrays of Fezzes, or that add or remove users, do not populate this field (it will be nil).
  posts?: [FezPostData];
}

export interface FezData {
  /// The ID of the fez.
  fezID: string;
  /// The fez's owner.
  owner: UserHeader;
  /// The `FezType` .label of the fez.
  fezType: FezType;
  /// The title of the fez.
  title: string;
  /// A description of the fez.
  info: string;
  /// The starting time of the fez.
  startTime?: Date;
  /// The ending time of the fez.
  endTime?: Date;
  /// The 3 letter abbreviation for the active time zone at the time and place where the fez is happening.
  timeZone?: string;
  /// The location for the fez.
  location?: string;
  /// How many users are currently members of the fez. Can be larger than maxParticipants; which indicates a waitlist.
  participantCount: number;
  /// The min number of people for the activity. Set by the host. Fezzes may?? auto-cancel if the minimum participant count isn't met when the fez is scheduled to start.
  minParticipants: number;
  /// The max number of people for the activity. Set by the host.
  maxParticipants: number;
  /// TRUE if the fez has been cancelled by the owner. Cancelled fezzes should display CANCELLED so users know not to show up, but cancelled fezzes are not deleted.
  cancelled: boolean;
  /// The most recent of: Creation time for the fez, time of the last post (may not exactly match post time), user add/remove, or update to fezzes' fields.
  lastModificationTime: Date;
  /// Will be nil if user is not a member of the fez (in the participant or waiting lists).
  members?: MembersOnlyData;
}

export interface FezListData {
  /// Pagination into the results set.
  paginator: Paginator;
  ///The fezzes in the result set.
  fezzes: [FezData];
}
