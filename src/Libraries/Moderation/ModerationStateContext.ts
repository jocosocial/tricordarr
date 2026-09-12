import {QueryKey} from '@tanstack/react-query';

import {ModerationSetStatePath} from '#src/Queries/Moderation/ModerationMutations';
import {
  FezModerationData,
  FezPostModerationData,
  ForumModerationData,
  ForumPostModerationData,
  ProfileModerationData,
} from '#src/Structs/ControllerStructs';

/**
 * True when the reports screen should show closed groups. Accepts boolean params and deep-link strings.
 */
export const isClosedReportsParam = (closed?: boolean | string): boolean => {
  return closed === true || closed === 'closed' || closed === 'true';
};

/**
 * Union of per-content moderation payloads that support Set State.
 */
export type ModeratedContentData =
  ForumPostModerationData | ForumModerationData | FezModerationData | FezPostModerationData | ProfileModerationData;

/**
 * Set-state path, content ID, and cache keys derived from a moderate-screen payload.
 */
export interface ModerationStateContext {
  path: ModerationSetStatePath;
  contentID: string;
  cacheKeys: QueryKey[];
  isDeleted: boolean;
}

export namespace ModerationStateContext {
  /**
   * Derives set-state path, content ID, and cache keys from moderate-screen data.
   */
  export const fromData = (data: ModeratedContentData): ModerationStateContext => {
    if ('forumPost' in data) {
      const contentID = String(data.forumPost.postID);
      return {
        path: 'forumpost',
        contentID,
        cacheKeys: ForumPostModerationData.getCacheKeys(contentID, data.forumPost.forumID),
        isDeleted: data.isDeleted,
      };
    }
    if ('fezPost' in data) {
      const contentID = String(data.fezPost.postID);
      return {
        path: 'fezpost',
        contentID,
        cacheKeys: FezPostModerationData.getCacheKeys(contentID, data.fezID),
        isDeleted: data.isDeleted,
      };
    }
    if ('fez' in data) {
      return {
        path: 'fez',
        contentID: data.fez.fezID,
        cacheKeys: FezModerationData.getCacheKeys(data.fez.fezID),
        isDeleted: data.isDeleted,
      };
    }
    if ('profile' in data) {
      const userID = data.profile.header?.userID;
      return {
        path: 'profile',
        contentID: userID ?? '',
        cacheKeys: ProfileModerationData.getCacheKeys(userID),
        isDeleted: false,
      };
    }
    return {
      path: 'forum',
      contentID: data.forumID,
      cacheKeys: ForumModerationData.getCacheKeys(data.forumID, data.categoryID),
      isDeleted: data.isDeleted,
    };
  };
}
