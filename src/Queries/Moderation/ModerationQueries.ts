import {useTokenAuthPaginationQuery, useTokenAuthQuery} from '#src/Queries/TokenAuthQuery';
import {
  FezModerationData,
  FezPostModerationData,
  ForumModerationData,
  ForumPostModerationData,
  MicroKaraokeCompletedSong,
  MicroKaraokeSnippetModeration,
  ModeratorActionLogResponseData,
  PersonalEventModerationData,
  PhotostreamModerationData,
  ProfileModerationData,
  ReportModerationData,
  TwarrtModerationData,
  UserModerationData,
} from '#src/Structs/ControllerStructs';

/**
 * All user reports. The client groups them by reported content.
 */
export const useModerationReportsQuery = () => {
  return useTokenAuthQuery<ReportModerationData[]>('/mod/reports');
};

/**
 * Paginated log of moderator actions.
 */
export const useModerationLogQuery = () => {
  return useTokenAuthPaginationQuery<ModeratorActionLogResponseData>('/mod/moderationlog');
};

/**
 * Moderation payload for a twarrt, including edits and reports. Works if deleted.
 */
export const useTwarrtModerationQuery = (twarrtID: string) => {
  return useTokenAuthQuery<TwarrtModerationData>(`/mod/twarrt/${twarrtID}`);
};

/**
 * Moderation payload for a forum post, including edits and reports. Works if deleted.
 */
export const useForumPostModerationQuery = (postID: string) => {
  return useTokenAuthQuery<ForumPostModerationData>(`/mod/forumpost/${postID}`);
};

/**
 * Moderation payload for a forum thread, including title edits and reports. Works if deleted.
 */
export const useForumModerationQuery = (forumID: string) => {
  return useTokenAuthQuery<ForumModerationData>(`/mod/forum/${forumID}`);
};

/**
 * Moderation payload for a fez (LFG or seamail). Works if deleted.
 */
export const useFezModerationQuery = (fezID: string) => {
  return useTokenAuthQuery<FezModerationData>(`/mod/fez/${fezID}`);
};

/**
 * Moderation payload for a fez post. Fez posts have no edit log. Works if deleted.
 */
export const useFezPostModerationQuery = (postID: string) => {
  return useTokenAuthQuery<FezPostModerationData>(`/mod/fezpost/${postID}`);
};

/**
 * Moderation payload for a user profile, including past edits and reports.
 */
export const useProfileModerationQuery = (userID: string) => {
  return useTokenAuthQuery<ProfileModerationData>(`/mod/profile/${userID}`);
};

/**
 * Moderation payload for a user account: access level, temp quarantine, and all reports against their content.
 */
export const useUserModerationQuery = (userID: string) => {
  return useTokenAuthQuery<UserModerationData>(`/mod/user/${userID}`);
};

/**
 * Moderation payload for a photostream photo. Works if deleted.
 */
export const usePhotostreamModerationQuery = (photoID: string) => {
  return useTokenAuthQuery<PhotostreamModerationData>(`/mod/photostream/${photoID}`);
};

/**
 * Moderation payload for a personal event. Works if deleted.
 */
export const usePersonalEventModerationQuery = (eventID: string) => {
  return useTokenAuthQuery<PersonalEventModerationData>(`/mod/personalevent/${eventID}`);
};

/**
 * All Micro Karaoke songs, including incomplete and unapproved, for moderator review.
 */
export const useMicroKaraokeModerationSongListQuery = () => {
  return useTokenAuthQuery<MicroKaraokeCompletedSong[]>('/mod/microkaraoke/songlist');
};

/**
 * A single Micro Karaoke song as seen by moderators.
 */
export const useMicroKaraokeModerationSongQuery = (songID: number) => {
  return useTokenAuthQuery<MicroKaraokeCompletedSong>(`/mod/microkaraoke/song/${songID}`);
};

/**
 * Clips that make up a Micro Karaoke song, including open offers and filler.
 */
export const useMicroKaraokeModerationSnippetsQuery = (songID: number) => {
  return useTokenAuthQuery<MicroKaraokeSnippetModeration[]>(`/mod/microkaraoke/snippets/${songID}`);
};
