import {QueryKey} from '@tanstack/react-query';
import {HttpStatusCode} from 'axios';
import moment from 'moment-timezone';
import pluralize from 'pluralize';
import URLParse from 'url-parse';

import {SwiftarrClientApp, SwiftarrFeature} from '#src/Enums/AppFeatures';
import {DinnerTeam} from '#src/Enums/DinnerTeam';
import {FezType} from '#src/Enums/FezType';
import {LikeType} from '#src/Enums/LikeType';
import {UserAccessLevel} from '#src/Enums/UserAccessLevel';
import {UserRoleType} from '#src/Enums/UserRoleType';
import {createLogger} from '#src/Libraries/Logger';

const logger = createLogger('ControllerStructs.tsx');

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
  export const contains = (headers: UserHeader[] = [], header: UserHeader) => {
    return headers.map(h => h.userID).includes(header.userID);
  };

  export const getCacheKeys = (header?: UserHeader): QueryKey[] => {
    let cacheKeys: QueryKey[] = [['/user/profile']];
    if (header) {
      cacheKeys.push([`/users/${header.userID}/profile`]);
      cacheKeys.push([`/users/find/${header.username}`]);
    }
    return cacheKeys;
  };

  export const getRelationKeys = (header?: UserHeader): QueryKey[] => {
    const keys = [['/users/favorites'], ['/users/blocks'], ['/users/mutes']];
    if (header) {
      return getCacheKeys(header).concat(keys);
    }
    return keys;
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
  /// An optional Discord username for the user.
  discordUsername?: string;
  /// Whether the requesting user has favorited this user.
  isFavorite: boolean;
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
  /// The geopolitical region identifier that identifies the time zone -- e.g. "America/Los Angeles"
  serverTimeZoneID: string;
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
  /// The number of Seamail chats the user's been added to but not yet viewed. Does not include Seamails the user creates. Chats counted here will continue
  /// to be counted here and not in `newSeamailMessageCount` even if there are also new messages--until the user views the chat and clears the notification.
  addedToSeamailCount: number;
  /// The number of LFGs the user's been added to but not yet viewed. Doesn't include LFGs the user created nor ones they Joined by their own action.
  /// If a chat the user was added to (but hasn't yet viewed) gets new messages, that chat is counted in this total and not in `newFezMessageCount`.
  addedToLFGCount: number;
  /// The number of Private Events the user's been added to but not yet viewed. Doesn't include PEs the user created.
  /// If a chat the user was added to (but hasn't yet viewed) gets new messages, that chat is counted in this total and not in `newPrivateEventMessageCount`.
  addedToPrivateEventCount: number;
  /// Count of # of Seamail threads with new messages. NOT total # of new messages-a single seamail thread with 10 new messages counts as 1. 0 if not logged in.
  newSeamailMessageCount?: number;
  /// Count of # of Fezzes with new messages. 0 if not logged in.
  newFezMessageCount: number;
  /// Count of # of Private Events with new messages. 0 if not logged in.
  newPrivateEventMessageCount: number;
  /// The start time of the earliest event that the user has followed with a start time > now. nil if not logged in or no matching event.
  nextFollowedEventTime?: string;
  /// The event ID of the next future event the user has followed. This event's start time should always be == nextFollowedEventTime.
  /// If the user has favorited multiple events that start at the same time, this will be random among them.
  nextFollowedEventID?: string;

  /// The number of Micro Karaoke songs the user has contributed to and can now view.
  microKaraokeFinishedSongCount?: number;

  /// The start time of the earliest LFG that the user has joined with a start time > now. nil if not logged in or no matching LFG.
  nextJoinedLFGTime?: string;
  /// The LFG ID of the next future LFG the user has joined. This LFGs's start time should always be == nextJoinedLFGTime.
  /// If the user has joined multiple LFGs that start at the same time, this will be random among them.
  nextJoinedLFGID?: string;

  /// For each alertword the user has, this returns data on hit counts for that word.
  alertWords: UserNotificationAlertwordData[];

  /// Will be nil for non-moderator accounts.
  moderatorData?: ModeratorNotificationData;
  /// Notification counts that are only relevant for Moderators (and TwitarrTeam).
}

export namespace UserNotificationData {
  const valueOrZero = (value?: number) => value || 0;
  export const totalNewCount = (data?: UserNotificationData) => {
    if (!data) {
      return 0;
    }
    return (
      valueOrZero(data.newAnnouncementCount) +
      valueOrZero(data.newTwarrtMentionCount) +
      valueOrZero(data.newForumMentionCount) +
      valueOrZero(data.newSeamailMessageCount) +
      valueOrZero(data.newFezMessageCount) +
      valueOrZero(data.newPrivateEventMessageCount) +
      valueOrZero(data.addedToSeamailCount) +
      // We have no way to list "new LFGs/PEs you've been added to" in the API.
      valueOrZero(data.addedToLFGCount) +
      valueOrZero(data.addedToPrivateEventCount)
    );
  };

  export const totalNewSeamail = (data?: UserNotificationData) => {
    if (!data) {
      return 0;
    }
    return valueOrZero(data.newSeamailMessageCount) + valueOrZero(data.addedToSeamailCount);
  };

  export const totalNewLFG = (data?: UserNotificationData) => {
    if (!data) {
      return 0;
    }
    return valueOrZero(data.newFezMessageCount) + valueOrZero(data.addedToLFGCount);
  };

  export const totalNewPrivateEvent = (data?: UserNotificationData) => {
    if (!data) {
      return 0;
    }
    return valueOrZero(data.newPrivateEventMessageCount) + valueOrZero(data.addedToPrivateEventCount);
  };

  export const getCacheKeys = (): QueryKey[] => {
    return [['/notification/global']];
  };
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
  participants: UserHeader[];
  /// The users on a waiting list for the fez.
  waitingList: UserHeader[];
  /// How many posts the user can see in the fez. The count is returned even for calls that don't return the actual posts, but is not returned for
  /// fezzes where the user is not a member. PostCount does not include posts from blocked/muted users.
  postCount: number;
  /// How many posts the user has read. If postCount > readCount, there's posts to be read. UI can also use readCount to set the initial view
  /// to the first unread message.ReadCount does not include posts from blocked/muted users.
  readCount: number;
  /// Paginates the array in posts--gives the start and limit of the returned posts array relative to all the posts in the thread.
  paginator: Paginator;
  /// The FezPosts in the fez discussion. Methods that return arrays of Fezzes, or that add or remove users, do not populate this field (it will be nil).
  posts?: FezPostData[];
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
    var minimumSuffix = '';
    if (fez.minParticipants !== 0) {
      minimumSuffix = `, ${fez.minParticipants} minimum`;
    }
    if (fez.maxParticipants === 0) {
      return `${fez.participantCount} ${pluralize('attendee', fez.participantCount)}${minimumSuffix}`;
    }
    const waitlistCount: number = fez.members?.waitingList.length || 0;
    let attendeeCountString = `${fez.participantCount}/${fez.maxParticipants} ${pluralize(
      'participant',
      fez.maxParticipants,
    )}`;
    if (fez.participantCount >= fez.maxParticipants) {
      attendeeCountString = 'Full';
    }
    return `${attendeeCountString}, ${waitlistCount} waitlisted${minimumSuffix}`;
  };

  /**
   * @deprecated use useFez hook instead
   */
  const isMemberByID = (members: UserHeader[] | undefined, userID: string) => {
    if (!members) return false;
    return members.some(m => m.userID === userID);
  };

  /**
   * @deprecated use useFez hook instead
   */
  export const isParticipant = (fezData?: FezData, userID?: string) => {
    if (!fezData || !userID) return false;
    return isMemberByID(fezData.members?.participants, userID);
  };

  /**
   * @deprecated use useFez hook instead
   */
  export const isWaitlist = (fezData?: FezData, userID?: string) => {
    if (!fezData || !userID) return false;
    return isMemberByID(fezData.members?.waitingList, userID);
  };

  /**
   * @deprecated use useFez hook instead
   */
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
  /// An array of images (up to 8 for Shutternauts, otherwise up to `maxForumPostImages` from server settings, 1 when used in a Fez post). Each image can specify either new image data or an existing image filename.
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
            title: `${cruiseDayIndex - cruiseLength + 1} ${pluralize(
              'day',
              cruiseDayIndex - cruiseLength + 1,
            )} after boat`,
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

/// Optional sub-struct that only gets filled out for users with the Shutternaut role.
export interface ShutternautEventData {
  /// TRUE if a ShutternautManager has marked this event as needing to get photographed by someone.
  needsPhotographer: boolean;
  /// Shutternauts that have signed up to photograph this event.
  photographers: UserHeader[];
  /// TRUE if the current user is in the `photographers` array.
  userIsPhotographer: boolean;
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
  /// The performers who will be at the event.
  performers: PerformerHeaderData[];
  /// Optional data returned if the requestor is a member of the Shutternauts group. NULL for all other users.
  shutternautData?: ShutternautEventData;
}

export namespace EventData {
  export const getCacheKeys = (eventID?: string): QueryKey[] => {
    let queryKeys: QueryKey[] = [['/events'], ['/events/favorites']];
    if (eventID) {
      queryKeys.push([`/events/${eventID}`]);
    }
    return queryKeys;
  };
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
  /// An optional Discord username.
  discordUsername?: string;
}

/// Karaoke performance row. Returned by GET /api/v3/karaoke/latest and inside KaraokeSongData.performances.
/// Includes songID; isFavorite may be present when returned by the backend.
export interface KaraokePerformedSongsData {
  songID: string;
  artist: string;
  songName: string;
  performers: string;
  /// ISO 8601 date string.
  time: string;
  isFavorite?: boolean;
}

/// Single karaoke song from GET /api/v3/karaoke or GET /api/v3/karaoke/:song_id.
export interface KaraokeSongData {
  songID: string;
  artist: string;
  songName: string;
  isMidi: boolean;
  isVoiceReduced: boolean;
  isFavorite: boolean;
  performances: KaraokePerformedSongsData[];
}

/// Response from GET /api/v3/karaoke (search/favorites).
export interface KaraokeSongResponseData {
  totalSongs: number;
  start: number;
  limit: number;
  songs: KaraokeSongData[];
}

/// Response from GET /api/v3/karaoke/latest.
export interface KaraokePerformedSongsResult {
  songs: KaraokePerformedSongsData[];
  paginator: Paginator;
}

export namespace KaraokeSongData {
  export const getCacheKeys = (songID?: string): QueryKey[] => {
    const keys: QueryKey[] = [['/karaoke'], ['/karaoke/latest']];
    if (songID) {
      keys.push([`/karaoke/${songID}`]);
    }
    return keys;
  };
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
  users: UserHeader[];
  /// The registration code associated with this account. If this account doesn't have an associated regcode, will be the empty string.
  regCode: string;
}

export interface ImageUploadData {
  /// The filename of an existing image previously uploaded to the server. Ignored if image is set.
  filename?: string;
  /// The image in `Data` format.
  /// Which in client land means a Base64-encoded string.
  image?: string;
  /// Client-side only flag to track if this image should be saved to camera roll.
  /// Set to true for images taken with the camera (not picked from gallery).
  _shouldSaveToRoll?: boolean;
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
  /// If this forum is pinned or not.
  isPinned?: boolean;
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
  /// The threads in the category. Only populated for /categories/ID.
  forumThreads?: ForumListData[];
  /// Pagination of the results
  paginator: Paginator;
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
  /// If this forum is pinned or not.
  isPinned?: boolean;
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
  images?: string[];
  /// Whether the current user has bookmarked the post.
  isBookmarked: boolean;
  /// The current user's `LikeType` reaction on the post.
  userLike?: LikeType;
  /// The total number of `LikeType` reactions on the post.
  likeCount: number;
  /// Whether the post has been pinned to the forum.
  isPinned?: boolean;
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
  /// The posts in the forum.
  posts: PostData[];
  /// Pagination into the results set. Because `/forum/post/search` filters the result set after the db query, `posts.count` could be less than `paginator.limit`
  /// even if we're not at the end of the results. To get the next 'page' of results, be sure to add `limit` to `start`; don't add`posts.count`.
  paginator: Paginator;
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
  export const hasUserReacted = (postData: PostDetailData, userID: string, likeType?: LikeType) => {
    if (!likeType) {
      return !!postData.userLike;
    }
    switch (likeType) {
      case LikeType.like:
        return postData.likes.flatMap(uh => uh.userID).includes(userID);
      case LikeType.laugh:
        return postData.laughs.flatMap(uh => uh.userID).includes(userID);
      case LikeType.love:
        return postData.loves.flatMap(uh => uh.userID).includes(userID);
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

/// Returns info about a single Photo from the Photostream.
///
/// Incorporated into `PhotostreamListData`, which is returned by: `GET /api/v3/photostream`
export interface PhotostreamImageData {
  /// The ID of the photostream record (NOT the id of the image)..
  postID: number;
  /// The time the image was taken--not necessarily the time the image was uploaded..
  createdAt: string;
  /// The post's author.
  author: UserHeader;
  /// The filename of the image.
  image: string;
  /// The schedule event this image was tagged with, if any. Stream photos will be tagged with either an event or a location.
  event?: EventData;
  /// The boat location this image was tagged with, if any. Value will be a raw string from  `PhotoStreamBoatLocation` or nil.  Stream photos will be tagged with either an event or a location.
  location: string;
}

export namespace PhotostreamImageData {
  export const getCacheKeys = (): QueryKey[] => {
    return [['/photostream'], ['/photostream/placenames']];
  };
}

/// Returns paginated data on photos in the photo stream. Non-Mods should only have access to the most recent photos, with no pagination.
/// However: `/api/v3/photostream` returns one of thse objects even for non-mod users--it just returns 30 photos and sets `paginator.total` to 30.
///
export interface PhotostreamListData {
  photos: PhotostreamImageData[];
  paginator: Paginator;
}

/// Returns information on available tags to use when tagging a photo to be uploaded to the photostream. A photo may be tagged with an event or with a generic
/// ship location. Calling `api/v3/photostream/placenames` fills the `events` parameter with information about events that are currently happening. When
/// a photo is uploaded, its tag is validated, and validation will fail if the tagged event has ended.
///
export interface PhotostreamLocationData {
  events: EventData[];
  locations: string[];
}

/// Uploads a photo to the photostream. Either the eventID or the locationName must be set.
/// Sent in request body to: `POST /api/v3/photostream/upload`.
export interface PhotostreamUploadData {
  /// The image data.
  image: string;
  /// The time the image was taken--not necessarily the time the image was uploaded..
  createdAt: string;
  /// The Schedule Event the photo was taken at, if any. ID must refer to an event that is currently happening--that is, an event that `/api/v3/photostream/placenames` returns.
  /// Either the eventID or locationName field must be non-nil.
  eventID?: string;
  /// Where the picture was taken. Valid values come from `/api/v3/photostream/placenames` and are transient. Names include titles of events currently happening..
  locationName?: string;
}

// export interface PersonalEventData {
//   personalEventID: string;
//   title: string;
//   description?: string;
//   startTime: string;
//   endTime: string;
//   timeZone: string;
//   timeZoneID: string;
//   location?: string;
//   lastUpdateTime: string;
//   owner: UserHeader;
//   participants: UserHeader[];
// }
//
// export interface PersonalEventContentData {
//   /// The title for the PersonalEvent.
//   title: string;
//   /// A description of the PersonalEvent.
//   description?: string;
//   /// The starting time for the PersonalEvent.
//   startTime: string;
//   /// The ending time for the PersonalEvent.
//   endTime: string;
//   /// The location for the PersonalEvent.
//   location?: string;
//   /// Users to invite to this PersonalEvent.
//   participants: string[];
// }

interface SwiftarrClientConfigV2 {
  latestVersion: string;
}

export interface SwiftarrClientConfig {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
  };
  spec: SwiftarrClientConfigV2;
}

export interface MicroKaraokeCompletedSong {
  /// Each song the server works on collecting (via piecing together multiple song clips from users) gets an ID
  songID: number;
  // The song title, as it'd appear in karaoke metadata
  songName: string;
  /// The artist, as they'd appear in karaoke metadata
  artistName: string;
  /// How many song slots this song has. NOT how many are currently filled. This number includes pre-filled 'filler' slots for instrumental sections.
  totalSnippetSlots: number;
  /// Always TRUE unless the user is a mod, in which case will be FALSE for songs that have all the necessary clips recorded but require mod approval to publish.
  modApproved: boolean;
  /// When the song's clips were last modified. Usually the time the final snippet gets uploaded (although 'final' means '30th out of 30'
  /// and not 'the one at the end of the song'). However, clips can get deleted via moderation, causing the server to re-issue an offer
  /// for the deleted clip, which may change the completion time. NIL if song isn't complete
  completionTime?: string;
  /// TRUE if the current user contributed to the song
  userContributed: boolean;
}

export interface MicroKaraokeSongManifest {
  /// Each song the server works on collecting (via piecing together multiple song clips from users) gets an ID
  songID: number;
  /// TRUE if all the clips for this song must be recorded in portrait mode. FALSE if they all need to be landscape.
  portraitMode: boolean;
  /// The video snippets that make up the song. Some snippets may be 'filler', such as for a song's instrumental section.
  snippetVideoURLs: string[];
  /// How long each snippet should be, in seconds.
  snippetDurations: number[];
  /// The karaoke audio for the song
  karaokeMusicTrack: string;
}

export interface MicroKaraokeOfferPacket {
  ///	The ID of this offer. Offers are good for 30 minutes (or until fulfilled with a snippet upload), and a user may only
  /// have 1 open offer at a time. If a user re-requests while the offser is open, they should get the same offer response.
  /// This prevents users shopping for the lyric they want to sing.
  offerID: string;
  /// Each song the server works on collecting (via piecing together multiple song clips from users) gets an ID
  songID: number;
  /// The song title, as it'd appear in karaoke metadata
  songName: string;
  /// The artist, as they'd appear in karaoke metadata
  artistName: string;
  /// Song tempo. May not be exact; used for the timing of the countdown prompt before recording starts.
  bpm: number;
  /// TRUE if all the clips for this song must be recorded in portrait mode. FALSE if they all need to be landscape.
  portraitMode: boolean;
  /// Which song snippet is being offered (songs are divided into 30-50 snippets when configured for use on Swiftarr)
  snippetIndex: number;
  /// The lyrics the user is supposed to sing. Generally 1-2 lines. NOT the entire lyrics for the song.
  lyrics: string;
  /// An URL that points to a .mp3 file containing ~6 seconds of the original song
  /// This clip will have the artist singing the lyrics of 1-2 lines of the song, for the user to listen to before recording.
  originalSnippetSoundURL: string;
  /// This is a karaoke backing snippet to play while recording. It will be the same part of the song as `originalSnippetSoundURL`
  /// but MAY NOT quite be the same duration (karaoke versions of songs are sometimes faster or slower tempo then their originals).
  /// As a karaoke track, this snippet won't have main vocals, but it also could have slightly diffeent instruments/sounds.
  karaokeSnippetSoundURL: string;
  /// The time that this offer expires. If no upload has happened by this time, the user will need to request a new snippet offer,
  /// which will likely be for a different part of the song, or even a different song altogether.
  offerExpirationTime: string;
}

export interface PerformerHeaderData {
  /// Database ID of hte performer. Used to get full performer info via `/api/v3/performer/<id>`
  id?: string;
  /// Name of the performer
  name: string;
  /// Photo ID, accessible through `/api/v3/image/[full|thumb]/<photo>` methods in the `ImageController`.
  photo?: string;
  /// TRUE if the performer is on JoCo's list of featured guests. FALSE if this is a shadow event organizer.
  isOfficialPerformer: boolean;
}

export interface PerformerData {
  /// ID, name, photo -- used to create a title card
  header: PerformerHeaderData;
  /// For Shadow Event Organizers, the Performer links to their User, but don't use the user's pronoun field when referring to them as a Performer.
  pronouns?: string;
  /// Bio may contain Markdown.
  bio?: string;
  /// Bandname, NGO, university, Podcast name, etc. Should only be filled if the org is relevant to the performer's event.
  organization?: string;
  /// Should only be non-nil if it's a title that's relevant to the performer's event. Hopefully won't contain 'Mr./Mrs."
  title?: string;
  /// Should be a fully-qualified URL.
  website?: string;
  /// Should be a fully-qualified URL.
  facebookURL?: string;
  /// Should be a fully-qualified URL.
  xURL?: string;
  /// Should be a fully-qualified URL.
  instagramURL?: string;
  /// Should be a fully-qualified URL.
  youtubeURL?: string;
  /// Full 4-digit years, ascending order-- like this: [2011, 2012, 2022]
  yearsAttended: number[];
  /// The events this performer is going to be performing at.
  events: EventData[];
  /// The user who  created this Performer. Only applies to Shadow Event organizers, and is only returned if the requester is a Moderator or higher.
  /// Although we track the User who created a Performer model for their shadow event for moderation purposes, the User behind the Performer
  /// shouldn't be shown to everyone.
  user?: UserHeader;
}

export namespace PerformerData {
  export const getCacheKeys = (performerID?: string): QueryKey[] => {
    let queryKeys: QueryKey[] = [['/performer/official'], ['/performer/shadow'], ['/performer/self']];
    if (performerID) {
      queryKeys.push([`/performer/${performerID}`]);
    }
    return queryKeys;
  };
}

export interface PerformerResponseData {
  /// The requested performers
  performers: PerformerHeaderData[];
  /// Pagination info.
  paginator: Paginator;
}

export interface TimeZoneChangeRecord {
  activeDate: string;
  timeZoneAbbrev: string;
  timeZoneID: string;
}

export interface TimeZoneChangeData {
  records: TimeZoneChangeRecord[];
  currentTimeZoneAbbrev: string;
  currentTimeZoneID: string;
  currentOffsetSeconds: number;
}

/// Parameters for the game recommender engine. Pass these values in, get back a `BoardgameResponseData` with a
/// list of games filtered to match the criteria, and sorted based on how well they match the criteria. The sort takes into account each games'
/// overall rating from BGG, the recommended number of players (not just min and max allowed players), the average playtime,
/// and the complexity score of the game.
///
/// Sent to these methods as the JSON  request body:
/// * `GET /api/v3/boardgames/recommend`
export interface BoardgameRecommendationData {
  /// How many players are going to play
  numPlayers: number;
  /// How much time they have, in minutes
  timeToPlay: number;
  /// If nonzero, limit results to games appropriate for this player age. Does not factor into the sort criteria. That is, if you
  /// request games appropriate for 14 years olds, games appropriate for ages 18 and older will be filtered out, but games appropriate
  /// for ages 1 and up won't be ranked any lower than games rated for 14 year olds.
  maxAge: number;
  /// If nonzero, filter OUT games with a minAge lower than this age. Useful for filtering out games intended for young children. Does not factor into the sort criteria.
  minAge: number;
  /// Desired complexity in the range [1...5], or zero to not consider complexity in rankings.
  complexity: number;
}

/// Wraps an array of `BoardgameData` with info needed to paginate the result set.
///
/// Returned by:
/// * `GET /api/v3/boardgames`
export interface BoardgameResponseData {
  /// Array of boardgames.
  gameArray: BoardgameData[];
  /// Total games in result set, and the start and limit into the found set.
  paginator: Paginator;
}

/// Used to obtain a list of board games.
///
/// Each year there's a list of boardgames published that'll be brought onboard for the games library. The board game data is produced
/// by running a script that pulls game data from `http://boardgamegeek.com`'s API and merging it with the games library table.
///
/// Games in the library may not match anything in BGG's database (or we can't find a match), so all the BGG fields are optional.
///
/// Returned by:
/// * `GET /api/v3/boardgames` (inside `BoardgameResponseData`)
/// * `GET /api/v3/boardgames/:boardgameID`
/// * `GET /api/v3/boardgames/expansions/:boardgameID`
///
/// See `BoardgameController.getBoardgames(_:)`, `BoardgameController.getExpansions(_:)`.
export interface BoardgameData {
  // The database ID for this game. Used to request a list of expansion sets for a game.
  gameID: string;
  /// Name from the JoCo boardgame list
  gameName: string;
  /// How many copies are being brought aboard.
  numCopies: number;
  /// Some games each year are loaned to the library by specific people.
  donatedBy?: string;
  /// Any notes on the game (specific printing, wear and tear)
  notes?: string;

  /// From BoardGameGeek's API.
  yearPublished?: string;
  /// From BGG's API. Usually several paragraphs.
  gameDescription?: string;
  /// BGG's 'subdomain' value. Games can have multiple values, but often have none. BGG currently lists 8 subdomains.
  gameTypes: string[];
  /// BGG's 'category' value. Games can have multiple values. BGG currently lists 84 categories.
  categories: string[];
  /// BGG's 'mechanic' value. Games can have multiple values. BGG currently lists 192 mechanics.
  mechanics: string[];

  /// From BGG's API.
  minPlayers?: number;
  /// From BGG's API.
  maxPlayers?: number;
  /// From BGG's API. This is the value from the "numPlayers" poll that got the highest number of "Best" votes.
  suggestedPlayers?: number;

  /// From BGG's API. Playtime in minutes.
  minPlayingTime?: number;
  /// From BGG's API. Playtime in minutes.
  maxPlayingTime?: number;
  /// From BGG's API. Playtime in minutes.
  avgPlayingTime?: number;

  /// From BGG's API. Suggested min player age in years. Min age could be determined by complexity or content.
  minAge?: number;
  /// From BGG's API. How many BGG reviewers submitted ratings.
  numRatings?: number;
  /// From BGG's API. Average game rating. Members can rate games with scores in the range 1...10
  avgRating?: number;
  /// From BGG's API. Members can score a games' complexity on a scale of 1...5, where 1 is Light and 5 is Heavy.
  complexity?: number;

  /// TRUE if this entry is an expansion for another game. Weirdly, the games library may not actually have the base game.
  /// At any rate, the base game is usually a requirement to play an expansion, and both must be checked out together.
  isExpansion: boolean;
  /// TRUE if this game has expansions that can be played with it.
  hasExpansions: boolean;
  /// TRUE if the user has favorited the game. FALSE if no one is logged in.
  isFavorite: boolean;
}

export namespace BoardgameData {
  export const getPlayers = (boardgame: BoardgameData) => {
    if (boardgame.minPlayers && boardgame.maxPlayers) {
      if (boardgame.minPlayers < boardgame.maxPlayers) {
        return `${boardgame.minPlayers}-${boardgame.maxPlayers} Players`;
      } else {
        return `${boardgame.minPlayers} Players`;
      }
    }
  };

  export const getPlayingTime = (boardgame: BoardgameData) => {
    if (boardgame.minPlayingTime && boardgame.maxPlayingTime) {
      if (boardgame.minPlayingTime < boardgame.maxPlayingTime) {
        return `${boardgame.minPlayingTime}-${boardgame.maxPlayingTime} minutes`;
      } else {
        return `${boardgame.minPlayingTime} minutes`;
      }
    }
  };
  export const getCacheKeys = (boardgameID?: string): QueryKey[] => {
    let queryKeys: QueryKey[] = [['/boardgames']];
    if (boardgameID) {
      queryKeys.push([`/boardgames/${boardgameID}`]);
      queryKeys.push([`/boardgames/expansions/${boardgameID}`]);
    }
    return queryKeys;
  };
}

/// Used to create and update Performer models.
///
/// Used by: `POST /api/v3/performer/forEvent/:event_id`
/// Used by: `POST /api/v3/performer/official/add`
export interface PerformerUploadData {
  /// If this is an existing performer that is being updated. Not required for shadow event organizers; we can find them by userID.
  performerID?: string;
  /// The name of the performer. Required.
  name: string;
  pronouns?: string;
  /// Bio can contain Markdown.
  bio?: string;
  /// New photo data if we're updating it, or the name of an existing photo on the server.
  photo: ImageUploadData;
  /// TRUE if this is an official performer, FALSE if it's a shadow event organizer. Note that this struct can't link a Performer with a User, so can't be
  /// used by admin/mods to create Shadow Event Organizers. The idea is that they should create their records themselves, but mods may have to edit them.
  isOfficialPerformer: boolean;
  organization?: string;
  title?: string;
  yearsAttended: number[];
  /// Social media URLs. Should be actual URLs we put into an HREF.
  website?: string;
  /// Social media URLs. Should be actual URLs we put into an HREF.
  facebookURL?: string;
  /// Social media URLs. Should be actual URLs we put into an HREF.
  xURL?: string;
  /// Social media URLs. Should be actual URLs we put into an HREF.
  instagramURL?: string;
  /// Social media URLs. Should be actual URLs we put into an HREF.
  youtubeURL?: string;
  /// UIDs of events where this performer is scheduled to appear.
  eventUIDs: string[];
}

/// Publicly available configuration information about the current cruise/sailing.
/// This endpoint allows client apps to fetch environment configuration rather than hardcoding values.
///
/// Returned by: `GET /api/v3/client/settings`
export interface ClientSettingsData {
  /// Canonical hostnames for the Twitarr server (e.g., "twitarr.com", "joco.hollandamerica.com")
  canonicalHostnames: string[];
  /// The date the cruise embarks, at midnight in the port time zone
  cruiseStartDate: string;
  /// Length of the cruise in days, including partial days (embarkation through disembarkation)
  cruiseLengthInDays: number;
  /// The Foundation TimeZone identifier for the port of departure (e.g., "America/New_York")
  portTimeZoneID: string;
  /// The abbreviation for the port time zone (e.g., "EST", "EDT")
  portTimeZoneAbbrev: string;
  /// Seconds from GMT for the port time zone
  portTimeZoneOffset: number;
  /// URL used for automated schedule updates (typically a sched.com iCalendar URL)
  scheduleUpdateURL: string;
  /// The name of the shipboard Wifi network
  shipWifiSSID?: string;
  /// If TRUE, users can create accounts, log in, and edit their profile before the cruise in a restricted pre-registration mode.
  enablePreregistration: boolean;
  /// Minimum user access level required to use the full server (e.g., "banned", "verified", "moderator", "admin")
  minAccessLevel: string;
  /// Maximum number of images allowed per forum post.
  maxForumPostImages: number;
  /// Unique identifier for this Postgres database installation (from pg_control_system())
  installationID: string;
}

export namespace ClientSettingsData {
  /**
   * Get the base URL from the payload scheduleUpdateURL.
   * Example: https://jococruise2025.sched.com/all.ics -> https://jococruise2025.sched.com
   */
  export const parseScheduleUpdateURL = (url: string): string => {
    try {
      const urlObj = new URLParse(url);
      // protocol includes the colon, so we need to add "//"
      return `${urlObj.protocol}//${urlObj.host}`;
    } catch (error) {
      logger.warn('Error parsing URL:', error);
      return url;
    }
  };

  /**
   * Extract a timezone-invariant date-only string from the server's cruiseStartDate.
   *
   * The server returns an ISO-8601 timestamp (e.g. "2025-03-02T05:00:00.000Z")
   * representing midnight in the port timezone. We extract the UTC calendar date
   * as a "YYYY-MM-DD" string so it survives JSON round-trips and timezone changes.
   */
  export const parseCruiseStartDate = (dateString: string): string => {
    const parsed = new Date(dateString);
    if (isNaN(parsed.getTime())) {
      logger.warn('Unexpected date format for cruiseStartDate:', dateString);
      return dateString;
    }
    const y = parsed.getUTCFullYear();
    const m = String(parsed.getUTCMonth() + 1).padStart(2, '0');
    const d = String(parsed.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  /**
   * Build a Date representing midnight in the port timezone for a date-only string.
   *
   * This produces a consistent absolute time regardless of the device's local timezone,
   * preventing day-shift bugs when the device timezone differs from the port timezone.
   */
  export const buildCruiseStartDate = (dateStr: string, portTimeZoneID: string): Date => {
    return moment.tz(dateStr, 'YYYY-MM-DD', portTimeZoneID).toDate();
  };
}

/// Used to obtain the current user's ID, username and logged-in status.
///
/// Returned by: `GET /api/v3/user/whoami`
///
/// See `UserController.whoamiHandler(_:).`
export interface CurrentUserData {
  /// The currrent user's ID.
  userID: string;
  /// The current user's username.
  username: string;
  /// Whether the user is currently logged in.
  isLoggedIn: boolean;
  /// The current user's access level (role).
  accessLevel: UserAccessLevel;
  /// A list of the user's roles
  roles: UserRoleType[];
}
