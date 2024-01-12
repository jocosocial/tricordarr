import {FezType} from '../Enums/FezType';
import {UserAccessLevel} from '../Enums/UserAccessLevel';
import {SwiftarrClientApp, SwiftarrFeature} from '../Enums/AppFeatures';
import EncryptedStorage from 'react-native-encrypted-storage';
import {StorageKeys} from '../Storage';
import {HttpStatusCode} from 'axios';
import {LikeType} from '../Enums/LikeType';
import pluralize from 'pluralize';
import {DinnerTeam} from '../Enums/DinnerTeam';

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
  /// An optional preferred form of address.
  preferredPronoun?: string;
}

export namespace UserHeader {
  export const contains = (headers: UserHeader[], header: UserHeader) => {
    return headers.map(h => h.userID).includes(header.userID);
  };
}

export interface ProfilePublicData {
  /// Basic info about the user--their ID, username, displayname, and avatar image.
  header: UserHeader;
  /// An optional real world name of the user.
  realName: string;
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
  /// An optional dinner team assignment.
  dinnerTeam?: DinnerTeam;
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

  /// Number of forum post @mentions the user has not read for @moderator.
  newModeratorForumMentionCount: number;

  /// Number of forum post @mentions the user has not read for @twitarrteam. Nil if the user isn't a member of TwitarrTeam.
  /// This is in the Moderator struct because I didn't want to make *another* sub-struct for TwitarrTeam, just to hold two values.
  newTTForumMentionCount: number;
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
  /// Whether user has muted the fez.
  isMuted: boolean;
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
  /// The timezone ID that the ship is going to be in when the fez occurs. Example: "America/New_York".
  timeZoneID?: string;
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

/**
 * Bonus helper functions for FezData.
 */
export namespace FezData {
  /**
   * Get a label for the number of attendees of this Fez. If the count is 0 that means
   * it is unlimited and we don't need to tell users how many are remaining.
   * @param fez This particular chat.
   */
  export const getParticipantLabel = (fez: FezData) => {
    if (fez.maxParticipants === 0) {
      return `${fez.participantCount} attendees, ${fez.minParticipants} minimum`;
    }
    const waitlistCount: number = fez.members?.waitingList.length || 0;
    let attendeeCountString = `${fez.participantCount}/${fez.maxParticipants} participants`;
    if (fez.participantCount >= fez.maxParticipants) {
      attendeeCountString = 'Full';
    }
    return `${attendeeCountString}, ${waitlistCount} waitlisted, ${fez.minParticipants} minimum`;
  };

  const isMember = (members: UserHeader[] | undefined, user: UserHeader) => {
    if (!members) {
      return false;
    }
    for (let i = 0; i < members.length; i++) {
      if (members[i].userID === user.userID) {
        return true;
      }
    }
    return false;
  };

  export const isParticipant = (fezData?: FezData, user?: UserHeader) => {
    if (!user || !fezData) {
      return false;
    }
    return isMember(fezData.members?.participants, user);
  };

  export const isWaitlist = (fezData?: FezData, user?: UserHeader) => {
    if (!user || !fezData) {
      return false;
    }
    return isMember(fezData.members?.waitingList, user);
  };

  export const isFull = (fezData: FezData) => {
    if (fezData.maxParticipants === 0 || !fezData.members) {
      return false;
    }
    return fezData.members.participants.length >= fezData.maxParticipants;
  };
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
  message: string;
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

export namespace DailyThemeData {
  export const getThemeForDay = (cruiseDayIndex: number, cruiseLength: number, dailyThemeData?: DailyThemeData[]) => {
    if (dailyThemeData) {
      let todaysTheme: DailyThemeData | undefined;
      dailyThemeData.every(dt => {
        if (dt.cruiseDay === cruiseDayIndex) {
          todaysTheme = dt;
        }
        return true;
      });
      // Default Themes
      if (!todaysTheme) {
        if (cruiseDayIndex >= cruiseLength - 1) {
          todaysTheme = {
            themeID: 'default_theme_after',
            title: `${cruiseDayIndex - cruiseLength + 1} Days after Boat`,
            info: "JoCo Cruise has ended. Hope you're enjoying being back in the real world.",
            cruiseDay: cruiseDayIndex,
          };
        } else if (cruiseDayIndex < 0) {
          todaysTheme = {
            themeID: 'default_theme_before',
            title: `${Math.abs(cruiseDayIndex)} ${pluralize('day', Math.abs(cruiseDayIndex))} before boat!`,
            info: 'Soon™',
            cruiseDay: cruiseDayIndex,
          };
        } else {
          todaysTheme = {
            themeID: 'default_theme_before',
            title: `Cruise Day ${cruiseDayIndex + 1}: No Theme Day`,
            info: 'A wise man once said, "A day without a theme is like a guitar ever-so-slightly out of tune. You can play it however you want, and it will be great, but someone out there will know that if only there was a theme, everything would be in tune."',
            cruiseDay: cruiseDayIndex,
          };
        }
      }
      return todaysTheme;
    }
  };
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

export interface HealthResponse {
  status: HttpStatusCode;
  reason: string;
  error: boolean;
}

export interface CreatedUserData {
  /// The newly created user's ID.
  userID: string;
  /// The newly created user's username.
  username: string;
  /// The newly created user's recoveryKey.
  recoveryKey: string;
}

export interface UserCreateData {
  /// The user's username.
  username: string;
  /// The user's password.
  password: string;
  /// Verification code, emailed to all cruisegoers by THO before embarkation. On success, user will be created with .verified access level, consuming this code.
  /// Required for creating 'parent' accounts; must be nil when used to create a sub-account with `POST /api/v3/user/add`.
  verification?: string;
}

export interface EventData {
  /// The event's ID. This is the Swiftarr database record for this event.
  eventID: string;
  /// The event's UID. This is the VCALENDAR/ICS File/sched.com identifier for this event--what calendar software uses to correllate whether 2 events are the same event.
  uid: string;
  /// The event's title.
  title: string;
  /// A description of the event.
  description: string;
  /// Starting time of the event
  startTime: string;
  /// Ending time of the event.
  endTime: string;
  /// The timezone that the ship is going to be in when the event occurs. Delivered as an abbreviation e.g. "EST".
  timeZone: string;
  /// The timezone ID that the ship is going to be in when the event occurs. Example: "America/New_York".
  timeZoneID: string;
  /// The location of the event.
  location: string;
  /// The event category.
  eventType: string;
  /// The last time data for this event was modified. Used for change management.
  lastUpdateTime: string;
  /// The event's associated `Forum`.
  forum?: string;
  /// Whether user has favorited event.
  isFavorite: boolean;
}

export interface UserProfileUploadData {
  /// Basic info about the user--their ID, username, displayname, and avatar image. May be nil on POST.
  header?: UserHeader;
  /// The displayName, again. Will be equal to header.displayName in results. When POSTing, set this field to update displayName.
  displayName: string;
  /// An optional real name of the user.
  realName: string;
  /// An optional preferred form of address.
  preferredPronoun?: string;
  /// An optional home location (e.g. city).
  homeLocation: string;
  /// An optional ship cabin number.
  roomNumber: string;
  /// An optional email address.
  email: string;
  /// An optional short greeting/message to visitors of the profile.
  message: string;
  /// An optional blurb about the user.
  about: string;
  /// An optional dinner team assignment.
  dinnerTeam?: DinnerTeam;
}

export interface NoteCreateData {
  /// The text of the note.
  note: string;
}

export interface NoteData {
  /// Timestamp of the note's creation.
  createdAt: string;
  /// Timestamp of the note's last update.
  updatedAt: string;
  /// The user the note is written about. The target user does not get to see notes written about them.
  targetUser: UserHeader;
  /// The text of the note.
  note: string;
}

export interface RegistrationCodeUserData {
  // User accounts associated with the reg code. First item in the array is the primary account.
  users: [UserHeader];
  /// The registration code associated with this account. If this account doesn't have an associated regcode, will be the empty string.
  regCode: string;
}

export interface ImageUploadData {
  /// The filename of an existing image previously uploaded to the server. Ignored if image is set.
  filename?: string;
  /// The image in `Data` format.
  /// Which in client land means a Base64-encoded string.
  image?: string;
}

export interface ForumListData {
  /// The forum's ID.
  forumID: string;
  /// The forum's creator.
  creator: UserHeader;
  /// The forum's title.
  title: string;
  /// The number of posts in the forum.
  postCount: number;
  /// The number of posts the user has read.  Specifically, this will be the number of posts the forum contained the last time the user called a fn that returned a `ForumData`.
  /// Blocked and muted posts are included in this number, but not returned in the array of posts.
  readCount: number;
  /// Time forum was created.
  createdAt: string;
  /// The last user to post to the forum. Nil if there are no posts in the forum.
  lastPoster?: UserHeader;
  /// Timestamp of most recent post. Needs to be optional because admin forums may be empty.
  lastPostAt?: string;
  /// Whether the forum is in read-only state.
  isLocked: boolean;
  /// Whether user has favorited forum.
  isFavorite: boolean;
  /// Whether user has muted the forum.
  isMuted: boolean;
  /// If this forum is for an Event on the schedule, the start time of the event.
  eventTime?: string;
  /// If this forum is for an Event on the schedule, the timezone that the ship is going to be in when the event occurs. Delivered as an abbreviation e.g. "EST".
  timeZone?: string;
  /// If this forum is for an Event on the schedule, the timezone ID that the ship is going to be in when the event occurs. Example: "America/New_York".
  timeZoneID?: string;
  /// If this forum is for an Event on the schedule, the ID of the event.
  eventID?: string;
}

export interface CategoryData {
  /// The ID of the category.
  categoryID: string;
  /// The title of the category.
  title: string;
  /// The purpose string for the category.
  purpose: string;
  /// If TRUE, the user cannot create/modify threads in this forum. Should be sorted to top of category list.
  isRestricted: boolean;
  /// if TRUE, this category is for Event Forums, and is prepopulated with forum threads for each Schedule Event.
  isEventCategory: boolean;
  /// The number of threads in this category
  numThreads: number;
  /// The threads in the category. Only populated for /categories/ID.
  forumThreads?: [ForumListData];
}

export interface ForumData {
  /// The forum's ID.
  forumID: string;
  /// The ID of the forum's containing Category..
  categoryID: string;
  /// The forum's title
  title: string;
  /// The forum's creator.
  creator: UserHeader;
  /// Whether the forum is in read-only state.
  isLocked: boolean;
  /// Whether the user has favorited forum.
  isFavorite: boolean;
  /// Whether the user has muted the forum.
  isMuted: boolean;
  /// The paginator contains the total number of posts in the forum, and the start and limit of the requested subset in `posts`.
  paginator: Paginator;
  /// Posts in the forum.
  posts: PostData[];
  /// If this forum is for an Event on the schedule, the ID of the event.
  eventID?: string;
}

export interface PostData {
  /// The ID of the post.
  postID: number;
  /// The timestamp of the post.
  createdAt: string;
  /// The post's author.
  author: UserHeader;
  /// The text of the post.
  text: string;
  /// The filenames of the post's optional images.
  images?: [string];
  /// Whether the current user has bookmarked the post.
  isBookmarked: boolean;
  /// The current user's `LikeType` reaction on the post.
  userLike?: LikeType;
  /// The total number of `LikeType` reactions on the post.
  likeCount: number;
}

export interface ForumSearchData {
  /// Paginates the list of forum threads. `paginator.total` is the total number of forums that match the request parameters.
  /// `limit` and `start` define a slice of the total results set being returned in `forumThreads`.
  paginator: Paginator;
  /// A slice of the set of forum threads that match the request parameters.
  forumThreads: ForumListData[];
}

export interface PostSearchData {
  /// The search query used to create these results.
  queryString: string;
  /// The total number of posts in the result set. The actual # of results returned may be fewer than this, even if we return 'complete' results. This is due to additional filtering that
  /// is done after the database query. See notes on `ContentFilterable.filterForMention(of:)`
  totalPosts: number;
  /// The index into totalPosts of the first post in the `posts` array. 0 is the index of the first result. This number is usually  a multiple of `limit` and indicates the page of results.
  start: number;
  /// The number of posts the server attempted to gather. posts.count may be less than this number if posts were filtered out by post-query filtering, or if start + limit > totalPosts.
  limit: number;
  /// The posts in the forum.
  posts: PostData[];
}

export interface PostDetailData {
  /// The ID of the post.
  postID: number;
  /// The ID of the Forum containing the post.
  forumID: number;
  /// The timestamp of the post.
  createdAt: string;
  /// The post's author.
  author: UserHeader;
  /// The text of the forum post.
  text: string;
  /// The filenames of the post's optional images.
  images?: string[];
  /// Whether the current user has bookmarked the post.
  isBookmarked: boolean;
  /// The current user's `LikeType` reaction on the post.
  userLike?: LikeType;
  /// The users with "laugh" reactions on the post.
  laughs: UserHeader[];
  /// The users with "like" reactions on the post.
  likes: UserHeader[];
  /// The users with "love" reactions on the post.
  loves: UserHeader[];
}

export namespace PostDetailData {
  export const hasUserReacted = (postData: PostDetailData, userHeader: UserHeader, likeType?: LikeType) => {
    if (!likeType) {
      return !!postData.userLike;
    }
    switch (likeType) {
      case LikeType.like:
        return postData.likes.flatMap(uh => uh.userID).includes(userHeader.userID);
      case LikeType.laugh:
        return postData.laughs.flatMap(uh => uh.userID).includes(userHeader.userID);
      case LikeType.love:
        return postData.loves.flatMap(uh => uh.userID).includes(userHeader.userID);
    }
  };
}

export interface ForumCreateData {
  /// The forum's title.
  title: string;
  /// The first post in the forum.
  firstPost: PostContentData;
}

export interface UserRecoveryData {
  /// The user's username.
  username: string;
  /// The string to use – any one of: password / registration key / recovery key.
  recoveryKey: string;
  /// The new password to set for the account.
  newPassword: string;
}
