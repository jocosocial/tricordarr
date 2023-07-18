import {FezType} from '../Enums/FezType';
import {UserAccessLevel} from '../Enums/UserAccessLevel';
import {SwiftarrClientApp, SwiftarrFeature} from '../Enums/AppFeatures';
import EncryptedStorage from 'react-native-encrypted-storage';
import {StorageKeys} from '../Storage';

/**
 * All of these interfaces come from Swiftarr.
 * https://github.com/jocosocial/swiftarr/blob/master/Sources/App/Controllers/Structs/ControllerStructs.swift
 */
export interface TokenStringData {
  /// The user ID of the newly logged-in user.
  userID: string;
  /// The user's access level.
  accessLevel: UserAccessLevel;
  /// The token string.
  token: string;
}

/**
 * Custom functions to interact with the local encrypted copy of the users token data.
 * I really hope I don't regret doing this.
 */
export namespace TokenStringData {
  export const getLocal = async () => await EncryptedStorage.getItem(StorageKeys.TOKEN_STRING_DATA);
  export const setLocal = async (data: TokenStringData) =>
    await EncryptedStorage.setItem(StorageKeys.TOKEN_STRING_DATA, JSON.stringify(data));
  export const clearLocal = async () => await EncryptedStorage.removeItem(StorageKeys.TOKEN_STRING_DATA);
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

export namespace UserHeader {
  // This is sorta based on https://github.com/jocosocial/swiftarr/blob/master/Sources/App/Site/Utilities/CustomLeafTags.swift#L562
  export function getByline(header: UserHeader) {
    if (header.displayName) {
      return `${header.displayName} (@${header.username})`;
    }
    return `@${header.username}`;
  }
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

export interface DisabledFeature {
  /// AppName and featureName act as a grid, allowing a specific feature to be disabled only in a specific app. If the appName is `all`, the server
  /// code for the feature may be causing the issue, requiring the feature be disabled for all clients.
  appName: SwiftarrClientApp;
  /// The feature to disable. Features roughly match API controller groups.
  featureName: SwiftarrFeature;
}

/// Returns status about a single Alertword, for either Twarrts of ForumPost hits on that word.
/// Used inside UserNotificationData.
export interface UserNotificationAlertwordData {
  /// Will be one of the user's current alert keywords.
  alertword: string;
  /// The total number of twarrts that include this word since the first time anyone added this alertword. We record alert word hits in
  /// a single global list that unions all users' alert word lists. A search for this alertword may return more hits than this number indicates.
  twarrtMentionCount: number;
  /// The number of twarrts that include this alertword that the user has not yet seen. Calls to view twarrts with a "?search=" parameter that matches the
  /// alertword will mark all twarrts containing this alertword as viewed.
  newTwarrtMentionCount: number;
  /// The total number of forum posts that include this word since the first time anyone added this alertword.
  forumMentionCount: number;
  /// The number of forum posts that include this alertword that the user has not yet seen.
  newForumMentionCount: number;
}

interface ModeratorNotificationData {
  /// The total number of open user reports. Does not count in-process reports (reports being 'handled' by a mod already).
  /// This value counts multiple reports on the same piece of content as separate reports.
  openReportCount: number;

  /// The number of Seamails to @moderator (more precisely, ones where @moderator is a participant) that have new messages.
  /// This value is very similar to `newSeamailMessageCount`, but for any moderator it gives the number of new seamails for @moderator.
  newModeratorSeamailMessageCount: number;

  /// The number of Seamails to @TwitarrTeam. Nil if user isn't a member of TwitarrTeam. This is in the Moderator struct because I didn't
  /// want to make *another* sub-struct for TwitarrTeam, just to hold one value.
  newTTSeamailMessageCount?: number;
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
  disabledFeatures: DisabledFeature[];
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
  alertWords: UserNotificationAlertwordData[];

  /// Will be nil for non-moderator accounts.
  moderatorData?: ModeratorNotificationData;
  /// Notification counts that are only relevant for Moderators (and TwitarrTeam).
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
  timestamp: string;
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
  startTime?: string;
  /// The ending time of the fez.
  endTime?: string;
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
  lastModificationTime: string;
  /// Will be nil if user is not a member of the fez (in the participant or waiting lists).
  members?: MembersOnlyData;
}

export interface FezListData {
  /// Pagination into the results set.
  paginator: Paginator;
  ///The fezzes in the result set.
  fezzes: FezData[];
}

export interface ErrorResponse {
  /// Always `true` to indicate this is a non-typical JSON response.
  error: boolean;
  /// The HTTP status code.
  status: number;
  /// The reason for the error. Displayable to the user.
  reason: string;
  /// Optional dictionary of field errors; mostly used for input JSON validation failures. A request with JSON content that fails validation may have field-level errors here,
  /// keyed by the keypath to the fields that failed validation.
  fieldErrors?: string | string[];
}

export interface ImageUploadData {
  /// The filename of an existing image previously uploaded to the server. Ignored if image is set.
  filename?: string;
  /// The image in `Data` format.
  image?: ArrayBuffer;
}

export interface PostContentData {
  /// The new text of the forum post.
  text: string;
  /// An array of up to 4 images (1 when used in a Fez post). Each image can specify either new image data or an existing image filename.
  /// For new posts, images will generally contain all new image data. When editing existing posts, images may contain a mix of new and existing images.
  /// Reorder ImageUploadDatas to change presentation order. Set images to [] to remove images attached to post when editing.
  images: ImageUploadData[];
  /// If the poster has moderator privileges and this field is TRUE, this post will be authored by 'moderator' instead of the author.
  /// Set this to FALSE unless the user is a moderator who specifically chooses this option.
  postAsModerator: boolean;
  /// If the poster has moderator privileges and this field is TRUE, this post will be authored by 'TwitarrTeam' instead of the author.
  /// Set this to FALSE unless the user is a moderator who specifically chooses this option.
  postAsTwitarrTeam: boolean;
}

export interface FezContentData {
  /// The `FezType` .label of the fez.
  fezType: FezType;
  /// The title for the FriendlyFez.
  title: string;
  /// A description of the fez.
  info: string;
  /// The starting time for the fez.
  startTime?: string;
  /// The ending time for the fez.
  endTime?: string;
  /// The location for the fez.
  location?: string;
  /// The minimum number of users needed for the fez.
  minCapacity: number;
  /// The maximum number of users for the fez.
  maxCapacity: number;
  /// Users to add to the fez upon creation. The creator is always added as the first user.
  initialUsers: string[];
  /// If TRUE, the Fez will be created by user @moderator instead of the current user. Current user must be a mod.
  createdByModerator?: boolean;
  /// If TRUE, the Fez will be created by user @TwitarrTeam instead of the current user. Current user must be a TT member.
  createdByTwitarrTeam?: boolean;
}

export interface ReportData {
  /// An optional message from the submitting user.
  message: String;
}

export interface KeywordData {
  /// The keywords.
  keywords: string[];
}

export interface AnnouncementData {
  /// Only THO and admins need to send Announcement IDs back to the API (to modify or delete announcements, for example), but caching clients can still use the ID
  /// to correlate announcements returned by the API with cached ones.
  id: number;
  /// The author of the announcement.
  author: UserHeader;
  /// The contents of the announcement.
  text: string;
  /// When the announcement was last modified.
  updatedAt: string;
  /// Announcements are considered 'active' until this time. After this time, `GET /api/v3/notification/announcements` will no longer return the announcement,
  /// and caching clients should stop showing it to users.
  displayUntil: string;
  /// TRUE if the announcement has been deleted. Only THO/admins can fetch deleted announcements; will always be FALSE for other users.
  isDeleted: boolean;
}

export interface DailyThemeData {
  /// The theme's ID Probably only useful for admins in order to edit or delete themes.
  themeID: string;
  /// A short string describing the day's theme. e.g. "Cosplay Day", or "Pajamas Day", or "Science Day".
  title: string;
  /// A longer string describing the theme, possibly with a call to action for users to participate.
  info: string;
  /// An image that relates to the theme.
  image?: string;
  /// Day of cruise, counted from `Settings.shared.cruiseStartDate`. 0 is embarkation day. Values could be negative (e.g. Day -1 is "Anticipation Day")
  cruiseDay: number;
}

export interface UserPasswordData {
  /// The user's current password.
  currentPassword: string;
  /// The user's desired new password.
  newPassword: string;
}

export interface UserUsernameData {
  /// The user's desired new username.
  username: string;
}
