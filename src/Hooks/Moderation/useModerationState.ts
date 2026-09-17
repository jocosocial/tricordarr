import {ModeratedContentData, ModerationStateContext} from '#src/Libraries/Moderation/ModerationStateContext';
import {
  FezModerationData,
  FezPostModerationData,
  ForumModerationData,
  ForumPostModerationData,
  ProfileModerationData,
} from '#src/Structs/ControllerStructs';

/**
 * Derives set-state path, content ID, and cache keys from moderate-screen data.
 */
export const useModerationState = () => {
  const fromData = (data: ModeratedContentData): ModerationStateContext => {
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

  return {fromData};
};
