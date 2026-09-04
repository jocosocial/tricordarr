import {QueryKey} from '@tanstack/react-query';

import {EventNotificationSetting} from '#src/Enums/EventNotificationSetting';
import {
  EventData,
  ImageUploadData,
  PerformerData,
  PerformerHeaderData,
  PerformerUploadData,
} from '#src/Structs/ControllerStructs';

/**
 * Admin-only DTOs from Swiftarr AdminControllerStructs.swift.
 * Public types that already live in ControllerStructs (TimeZoneChangeData, RegistrationCodeUserData)
 * stay there; this file holds the rest of the admin API surface.
 *
 * From https://github.com/jocosocial/swiftarr/blob/master/Sources/swiftarr/Controllers/Structs/AdminControllerStructs.swift
 */

/**
 * For admins to create and edit Announcements.
 * Required by `POST /api/v3/notification/announcement/create` and `POST /api/v3/notification/announcement/:id/edit`.
 */
export interface AnnouncementCreateData {
  /// The text of the announcement
  text: string;
  /// How long to display the announcement to users. ISO8601. Interpreted as floating time in the ship's Port timezone.
  displayUntil: string;
}

/**
 * Used during bulk import of User information.
 * Returned by `GET /api/v3/admin/bulkuserfile/verify` and `GET /api/v3/admin/bulkuserfile/update/apply`.
 */
export interface BulkUserUpdateCounts {
  /// Number of records found in the file
  totalRecordsProcessed: number;
  /// The number of records that were successfully imported.
  importedCount: number;
  /// Number of records that we didn't import because it appears the record is already in the DB.
  duplicateCount: number;
  /// Number of records that we couldn't import due to errors.
  errorCount: number;
}

export interface BulkUserUpdateVerificationData {
  /// If TRUE, this structure is returned as the result of the 'apply' method.
  changesApplied: boolean;
  /// Counts for User import.
  userCounts: BulkUserUpdateCounts;
  /// Counts for Performer import. Includes both official and shadow performers.
  performerCounts: BulkUserUpdateCounts;
  /// Counts for Events that were marked as needing photographers by the Shutternaut Manager.
  needsPhotographerCounts: BulkUserUpdateCounts;
  /// Cases where the server has a registered user with the same regcode as the update file, but the usernames differ.
  regCodeConflicts: string[];
  /// Cases where a username already exists on the server, tied to a different regcode.
  usernameConflicts: string[];
  /// Cases where the import threw an error.
  errorNotImported: string[];
  /// Errors that occurred while processing non-critical user data.
  otherErrors: string[];
}

export namespace BulkUserUpdateVerificationData {
  export const getCacheKeys = (): QueryKey[] => {
    return [['/admin/bulkuserfile/verify']];
  };
}

/**
 * For admins to upload new daily themes, or edit existing ones.
 * Required by `POST /api/v3/admin/dailytheme/create` and `POST /api/v3/admin/dailytheme/:id/edit`.
 */
export interface DailyThemeUploadData {
  /// A short string describing the day's theme.
  title: string;
  /// A longer string describing the theme.
  info: string;
  /// An optional image that relates to the theme.
  image?: ImageUploadData;
  /// Day of cruise, counted from cruiseStartDate. 0 is embarkation day.
  cruiseDay: number;
}

/**
 * Used to update the Event database.
 * Required by `POST /api/v3/admin/schedule/update`.
 */
export interface EventsUpdateData {
  /// The `.ics` event schedule file contents.
  schedule: string;
}

/**
 * Used to validate changes to the Event database.
 * Returned by `GET /api/v3/admin/schedule/verify`.
 */
export interface EventUpdateDifferenceData {
  /// Events in db but not in update.
  deletedEvents: EventData[];
  /// Events in update but not in db.
  createdEvents: EventData[];
  /// Events that will change their time as part of the update.
  timeChangeEvents: EventData[];
  locationChangeEvents: EventData[];
  minorChangeEvents: EventData[];
}

export namespace EventUpdateDifferenceData {
  export const getCacheKeys = (): QueryKey[] => {
    return [['/admin/schedule/verify']];
  };
}

/**
 * Used to return the results of comparing a bulk-scraped set of performers against the performers already in the database.
 */
export interface PerformerEventLinkPreviewData {
  /// The matched performer that would receive the event link.
  performerName: string;
  /// The title of the matched or scraped event.
  eventTitle: string;
  /// Human-readable start time for the event.
  eventStartTime: string;
  /// Optional location for matched DB events.
  eventLocation?: string;
}

export interface PerformerProfileFieldChangeData {
  /// Human-readable field label shown in bulk verify.
  fieldName: string;
  /// Existing value currently in the database.
  oldValue: string;
  /// Replacement value scraped from the source.
  newValue: string;
}

export interface UpdatedPerformerData {
  /// The canonical performer that will be updated if changes are applied.
  header: PerformerHeaderData;
  /// The set of profile fields that changed for this performer.
  changedFields: PerformerProfileFieldChangeData[];
}

/**
 * Returned by `GET /api/v3/admin/performer/bulk/verify`.
 */
export interface PerformerUpdateDifferenceData {
  /// Performers scraped from web that don't exist in the database.
  newPerformers: PerformerData[];
  /// Performers that exist in both source and DB but have profile changes.
  updatedPerformers: UpdatedPerformerData[];
  /// Count of performers that matched and had no changes.
  unchangedCount: number;
  /// Matched or new performer-event links that would be added if event linking is enabled on apply.
  eventLinksToAdd: PerformerEventLinkPreviewData[];
  /// Scraped performer-event references that could not be matched to any DB event.
  unmatchedScrapedEvents: PerformerEventLinkPreviewData[];
  /// Performers in DB but not found in the scraped source.
  notInSourcePerformers: PerformerHeaderData[];
}

export namespace PerformerUpdateDifferenceData {
  export const getCacheKeys = (): QueryKey[] => {
    return [['/admin/performer/bulk/verify']];
  };
}

/**
 * A single schedule update log entry.
 * Returned by `GET /api/v3/admin/schedule/viewlog`.
 */
export interface EventUpdateLogData {
  /// The ID of this log entry
  entryID: number;
  /// TRUE if this was an automatic, scheduled update.
  automaticUpdate: boolean;
  /// How many changes were made to the db as a result of this schedule update.
  changeCount: number;
  /// When the update was processed. ISO8601.
  timestamp: string;
  /// If the update failed, the reason why.
  error?: string;
}

export namespace EventUpdateLogData {
  export const getCacheKeys = (logID?: number): QueryKey[] => {
    if (logID !== undefined) {
      return [[`/admin/schedule/viewlog/${logID}`]];
    }
    return [['/admin/schedule/viewlog']];
  };
}

/**
 * Used to report what applying an Event-Performer pivot spreadsheet will do.
 */
export interface EventPerformerValidationData {
  /// The number of performers in the database
  oldPerformerCount: number;
  /// The number of performers found in the Excel spreadsheet.
  newPerformerCount: number;
  /// The number of performers in the spreadsheet that aren't in the db.
  missingPerformerCount: number;
  /// The number of performers in the db but not in the spreadsheet
  noEventsPerformerCount: number;
  /// The number of Events in the spreadsheet that list official performers and were matched with db events.
  eventsWithPerformerCount: number;
  /// Number of events in spreadsheet that we couldn't match with any database event.
  unmatchedEventCount: number;
  /// Errors detected while processing.
  errors: string[];
}

/**
 * Used to create a hunt including all puzzles.
 * Required by `POST /api/v3/hunts/create`.
 */
export interface HuntCreateData {
  title: string;
  description: string;
  puzzles: HuntPuzzleCreateData[];
}

export interface HuntPuzzleCreateData {
  title: string;
  body: string;
  /// ISO8601. Optional.
  unlockTime?: string;
  answer: string;
  hints: Record<string, string>;
}

/**
 * Used to edit a hunt. Nil fields are not modified.
 * Required by `PATCH /api/v3/hunts/:huntID`.
 */
export interface HuntPatchData {
  title?: string;
  description?: string;
}

/**
 * Used to modify a puzzle.
 * Required by `PATCH /api/v3/hunts/puzzles/:puzzleID`.
 * `unlockTime` uses explicit null to unset; omit to leave unchanged.
 */
export interface HuntPuzzlePatchData {
  title?: string;
  body?: string;
  answer?: string;
  /// ISO8601 if set, null to unset, omitted to leave unchanged.
  unlockTime?: string | null;
  /// If present, hints here will be added or updated. There is no way to delete an existing hint.
  hints?: Record<string, string>;
}

/**
 * Returns general info about registration codes.
 * Returned by `GET /api/v3/admin/regcodes/stats`.
 */
export interface RegistrationCodeStatsData {
  /// How many 'normal' reg codes are in the database.
  allocatedCodes: number;
  /// How many codes have been used to create verified accounts.
  usedCodes: number;
  /// How many codes have not yet been used.
  unusedCodes: number;
  /// The total number of Registration codes allocated for Discord pre-prod users.
  allocatedDiscordCodes: number;
  /// The number of codes that have been assigned to Discord users.
  assignedDiscordCodes: number;
  /// The number of Discord codes that have been used to create Twitarr accounts.
  usedDiscordCodes: number;
  /// Admin-created replacement codes. Currently always 0.
  adminCodes: number;
}

export namespace RegistrationCodeStatsData {
  export const getCacheKeys = (): QueryKey[] => {
    return [['/admin/regcodes/stats']];
  };
}

/**
 * The Bulk User Download file is a serialization of this object, plus a bunch of image files, all zipped up.
 */
export interface SaveRestoreData {
  /// Array of users to save and restore.
  users: UserSaveRestoreData[];
  /// Array of official performers to save and restore.
  performers: PerformerUploadData[];
  /// Array of event UIDs that need photographers.
  needsPhotographer: string[];
}

/**
 * Used to bulk save/restore user accounts. Contains sensitive data; admin routes only.
 */
export interface UserSaveRestoreData {
  username: string;
  displayName?: string;
  realName?: string;
  /// BCrypt hashed.
  password: string;
  /// BCrypt hashed.
  recoveryKey: string;
  /// Registration code - 6 letters, lowercased
  verification: string;
  accessLevel: string;
  userImage?: string;
  about?: string;
  email?: string;
  homeLocation?: string;
  message?: string;
  preferredPronoun?: string;
  roomNumber?: string;
  dinnerTeam?: string;
  discordUsername?: string;
  parentUsername?: string;
  roles: string[];
  /// Event UIDs, the thing in the ICS file spec--NOT database IDs.
  favoriteEvents: string[];
  /// Event UIDs the user has signed up to photograph
  photographerEvents: string[];
  /// Usernames of users this user has favorited
  favoriteUsers: string[];
  performer?: PerformerUploadData;
}

/**
 * An int-valued enum that defines what each value in the ServerRollupData counts array means.
 * Matches Swiftarr `ServerRollupData.CountType`.
 */
export enum ServerRollupCountType {
  user = 0,
  profileEdit = 1,
  userNote = 2,
  alertword = 3,
  muteword = 4,
  photoStream = 5,
  lfg = 6,
  lfgParticipant = 7,
  lfgPost = 8,
  seamail = 9,
  seamailPost = 10,
  privateEvent = 11,
  personalEvent = 12,
  forum = 13,
  forumPost = 14,
  forumPostEdit = 15,
  forumPostLike = 16,
  karaokePlayedSong = 17,
  microKaraokeSnippet = 18,
  userFavorite = 19,
  eventFavorite = 20,
  forumFavorite = 21,
  forumPostFavorite = 22,
  boardgameFavorite = 23,
  karaokeFavorite = 24,
  report = 25,
  moderationAction = 26,
  quartermasterItem = 27,
  quartermasterItemEdit = 28,
}

export namespace ServerRollupCountType {
  /**
   * User-readable name for each rollup row, matching Swiftarr SiteAdminController.
   */
  export const getLabel = (countType: ServerRollupCountType): string => {
    switch (countType) {
      case ServerRollupCountType.user:
        return 'Users';
      case ServerRollupCountType.profileEdit:
        return 'Profile Edits';
      case ServerRollupCountType.userNote:
        return 'User Notes';
      case ServerRollupCountType.alertword:
        return 'Alert Words';
      case ServerRollupCountType.muteword:
        return 'Mute Words';
      case ServerRollupCountType.photoStream:
        return 'Photo Stream Photos';
      case ServerRollupCountType.lfg:
        return 'LFGs';
      case ServerRollupCountType.lfgParticipant:
        return 'LFG Participants';
      case ServerRollupCountType.lfgPost:
        return 'LFG Posts';
      case ServerRollupCountType.seamail:
        return 'Seamails';
      case ServerRollupCountType.seamailPost:
        return 'Seamail Posts';
      case ServerRollupCountType.privateEvent:
        return 'Private Events';
      case ServerRollupCountType.personalEvent:
        return 'Personal Events';
      case ServerRollupCountType.forum:
        return 'Forum Threads';
      case ServerRollupCountType.forumPost:
        return 'Forum Posts';
      case ServerRollupCountType.forumPostEdit:
        return 'Forum Post Edits';
      case ServerRollupCountType.forumPostLike:
        return 'Forum Post Likes';
      case ServerRollupCountType.karaokePlayedSong:
        return 'Karaoke Played Songs';
      case ServerRollupCountType.microKaraokeSnippet:
        return 'Micro Karaoke Snippets';
      case ServerRollupCountType.userFavorite:
        return 'User Favorites';
      case ServerRollupCountType.eventFavorite:
        return 'Event Favorites';
      case ServerRollupCountType.forumFavorite:
        return 'Forum Favorites';
      case ServerRollupCountType.forumPostFavorite:
        return 'Forum Post Favorites';
      case ServerRollupCountType.boardgameFavorite:
        return 'Boardgame Favorites';
      case ServerRollupCountType.karaokeFavorite:
        return 'Karaoke Song Favorites';
      case ServerRollupCountType.report:
        return 'Moderation Reports';
      case ServerRollupCountType.moderationAction:
        return 'Moderation Actions';
      case ServerRollupCountType.quartermasterItem:
        return 'Quartermastarr Items';
      case ServerRollupCountType.quartermasterItemEdit:
        return 'Quartermastarr Item Edits';
    }
  };

  export const all: ServerRollupCountType[] = Object.values(ServerRollupCountType).filter(
    (value): value is ServerRollupCountType => typeof value === 'number',
  );
}

/**
 * An array of totals for various database entities.
 * Returned by `GET /api/v3/admin/rollup`.
 */
export interface ServerRollupData {
  /// An array with CountType.allCases.count values, indexed by ServerRollupCountType.
  counts: number[];
}

export namespace ServerRollupData {
  export const getCacheKeys = (): QueryKey[] => {
    return [['/admin/rollup']];
  };
}

/**
 * Used to enable/disable features. A featurePair with name: "kraken" and feature: "schedule"
 * indicates the Schedule feature of the Kraken app.
 */
export interface SettingsAppFeaturePair {
  /// Should match a SwiftarrClientApp.rawValue
  app: string;
  /// Should match a SwiftarrFeature.rawValue
  feature: string;
}

/**
 * Used to return the current Settings values.
 * Returned by `GET /api/v3/admin/serversettings`.
 */
export interface SettingsAdminData {
  minAccessUserLevel: string;
  enablePreregistration: boolean;
  maxAlternateAccounts: number;
  maximumTwarrts: number;
  maximumForums: number;
  maximumForumPosts: number;
  /// Max Image size in bytes.
  maxImageSize: number;
  /// Maximum number of images allowed per forum post.
  maxForumPostImages: number;
  /// Minimum seconds a user must wait between photostream uploads. `0` disables the limit.
  photostreamUploadRateLimit: number;
  forumAutoQuarantineThreshold: number;
  postAutoQuarantineThreshold: number;
  userAutoQuarantineThreshold: number;
  allowAnimatedImages: boolean;
  /// Currently disabled app:feature pairs.
  disabledFeatures: SettingsAppFeaturePair[];
  shipWifiSSID?: string;
  scheduleUpdateURL: string;
  upcomingEventNotificationSeconds: number;
  upcomingEventNotificationSetting: EventNotificationSetting;
  upcomingLFGNotificationSetting: EventNotificationSetting;
  enableSiteNotificationDataCaching: boolean;
}

export namespace SettingsAdminData {
  export const getCacheKeys = (): QueryKey[] => {
    return [['/admin/serversettings']];
  };
}

/**
 * Cache keys for admin access-level user lists (`UserHeader[]`).
 * These endpoints do not have a dedicated Swiftarr DTO.
 */
export namespace AdminAccessLevelListData {
  export const getCacheKeys = (): QueryKey[] => {
    return [['/admin/moderators'], ['/admin/twitarrteam'], ['/admin/tho']];
  };
}

/**
 * Cache keys for users-with-role lists (`GET /admin/userroles/:role`).
 */
export namespace AdminUserRoleListData {
  export const getCacheKeys = (role: string): QueryKey[] => {
    return [[`/admin/userroles/${role}`]];
  };
}

/**
 * Used to update the Settings values. Optional values set to undefined are not used to update Settings,
 * except `minUserAccessLevel`: Swiftarr's handler falls back to `.banned` when that field is missing
 * or not one of banned/moderator/twitarrteam/tho/admin. Feature-flag saves must send the current value.
 * Required by `POST /api/v3/admin/serversettings/update`.
 */
export interface SettingsUpdateData {
  minUserAccessLevel?: string;
  enablePreregistration?: boolean;
  maxAlternateAccounts?: number;
  maximumTwarrts?: number;
  maximumForums?: number;
  maximumForumPosts?: number;
  maxImageSize?: number;
  maxForumPostImages?: number;
  photostreamUploadRateLimit?: number;
  forumAutoQuarantineThreshold?: number;
  postAutoQuarantineThreshold?: number;
  userAutoQuarantineThreshold?: number;
  allowAnimatedImages?: boolean;
  /// Currently disabled app:feature pairs to enable. Only list deltas.
  enableFeatures: SettingsAppFeaturePair[];
  /// App:feature pairs to disable. Only list deltas.
  disableFeatures: SettingsAppFeaturePair[];
  shipWifiSSID?: string;
  scheduleUpdateURL?: string;
  upcomingEventNotificationSeconds?: number;
  upcomingEventNotificationSetting?: EventNotificationSetting;
  upcomingLFGNotificationSetting?: EventNotificationSetting;
  enableSiteNotificationDataCaching?: boolean;
}
