import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {ContentModerationStatus} from '#src/Enums/ContentModerationStatus';
import {ReportContentType} from '#src/Enums/ReportContentType';
import {UserAccessLevel} from '#src/Enums/UserAccessLevel';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';
import {ReportData} from '#src/Structs/ControllerStructs';

interface ModReportMutationProps {
  contentType: ReportContentType;
  contentID: string | number;
  reportData: ReportData;
}

export const useReportMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const queryHandler = async ({contentType, contentID, reportData}: ModReportMutationProps) => {
    return await apiPost<void, ReportData>(`/${contentType}/${contentID}/report`, reportData);
  };

  return useTokenAuthMutation(queryHandler);
};

/**
 * URL path segment for content types that support `setstate`.
 */
export type ModerationSetStatePath = 'twarrt' | 'forumpost' | 'forum' | 'fez' | 'fezpost' | 'profile';

interface SetModerationStateProps {
  path: ModerationSetStatePath;
  contentID: string;
  state: ContentModerationStatus;
}

/**
 * Sets ContentModerationStatus on reportable content.
 * POST /api/v3/mod/:path/:id/setstate/:state
 */
export const useSetModerationStateMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const queryHandler = async ({path, contentID, state}: SetModerationStateProps) => {
    const apiState = ContentModerationStatus.getApiParameter(state);
    return await apiPost(`/mod/${path}/${contentID}/setstate/${apiState}`);
  };

  return useTokenAuthMutation(queryHandler);
};

/**
 * Marks all open reports against the same content as handled by the current moderator.
 * POST /api/v3/mod/reports/:id/handleall
 */
export const useHandleReportsMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const queryHandler = async ({reportID}: {reportID: string}) => {
    return await apiPost(`/mod/reports/${reportID}/handleall`);
  };

  return useTokenAuthMutation(queryHandler);
};

/**
 * Closes all open reports against the same content.
 * POST /api/v3/mod/reports/:id/closeall
 */
export const useCloseReportsMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const queryHandler = async ({reportID}: {reportID: string}) => {
    return await apiPost(`/mod/reports/${reportID}/closeall`);
  };

  return useTokenAuthMutation(queryHandler);
};

/**
 * Moves a forum thread into a different category.
 * POST /api/v3/mod/forum/:forumID/setcategory/:categoryID
 */
export const useForumSetCategoryMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const queryHandler = async ({forumID, categoryID}: {forumID: string; categoryID: string}) => {
    return await apiPost(`/mod/forum/${forumID}/setcategory/${categoryID}`);
  };

  return useTokenAuthMutation(queryHandler);
};

/**
 * Sets a user's access level. Moderators may set quarantined or verified.
 * THO may also set banned or unverified.
 * POST /api/v3/mod/user/:id/setaccesslevel/:level
 */
export const useUserSetAccessLevelMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const queryHandler = async ({userID, accessLevel}: {userID: string; accessLevel: UserAccessLevel}) => {
    return await apiPost(`/mod/user/${userID}/setaccesslevel/${accessLevel}`);
  };

  return useTokenAuthMutation(queryHandler);
};

/**
 * Applies or clears a temporary quarantine. Pass 0 hours to clear.
 * POST /api/v3/mod/user/:id/tempquarantine/:hours
 */
export const useUserTempQuarantineMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const queryHandler = async ({userID, hours}: {userID: string; hours: number}) => {
    return await apiPost(`/mod/user/${userID}/tempquarantine/${hours}`);
  };

  return useTokenAuthMutation(queryHandler);
};

/**
 * Soft-deletes a photostream photo. Moderators only; authors cannot delete their own photos.
 * POST /api/v3/mod/photostream/:id/delete
 */
export const usePhotostreamModerationDeleteMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const queryHandler = async ({photoID}: {photoID: string}) => {
    return await apiPost(`/mod/photostream/${photoID}/delete`);
  };

  return useTokenAuthMutation(queryHandler);
};

/**
 * Deletes a Micro Karaoke snippet. Authors cannot delete their own clips.
 * POST /api/v3/mod/microkaraoke/snippet/:id/delete
 */
export const useMicroKaraokeSnippetDeleteMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const queryHandler = async ({snippetID}: {snippetID: string}) => {
    return await apiPost(`/mod/microkaraoke/snippet/${snippetID}/delete`);
  };

  return useTokenAuthMutation(queryHandler);
};

/**
 * Approves a completed Micro Karaoke song and notifies contributors.
 * POST /api/v3/mod/microkaraoke/approve/:songID
 */
export const useMicroKaraokeApproveSongMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const queryHandler = async ({songID}: {songID: number}) => {
    return await apiPost(`/mod/microkaraoke/approve/${songID}`);
  };

  return useTokenAuthMutation(queryHandler);
};

/**
 * Removes a participant from a personal event.
 * POST /api/v3/personalevents/:eventID/user/:userID/remove
 */
export const usePersonalEventMemberRemoveMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const queryHandler = async ({eventID, userID}: {eventID: string; userID: string}) => {
    return await apiPost(`/personalevents/${eventID}/user/${userID}/remove`);
  };

  return useTokenAuthMutation(queryHandler);
};
