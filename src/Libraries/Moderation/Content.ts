import {ContentModerationStatus} from '#src/Enums/ContentModerationStatus';
import {
  ForumData,
  ForumModerationData,
  PostData,
  PostDetailData,
  ProfilePublicData,
  UserProfileUploadData,
} from '#src/Structs/ControllerStructs';

/**
 * ForumPostEditScreen takes PostData; the moderation API returns PostDetailData.
 */
export const postDataFromDetail = (detail: PostDetailData): PostData => {
  return {
    postID: detail.postID,
    createdAt: detail.createdAt,
    author: detail.author,
    text: detail.text,
    images: detail.images,
    isBookmarked: detail.isBookmarked,
    userLike: detail.userLike,
    likeCount: detail.laughs.length + detail.likes.length + detail.loves.length,
  };
};

/**
 * Minimal ForumData so ForumThreadEditScreen can rename a thread from moderation.
 */
export const forumDataFromModeration = (data: ForumModerationData): ForumData => {
  return {
    forumID: data.forumID,
    categoryID: data.categoryID,
    title: data.title,
    creator: data.creator,
    isLocked: data.moderationStatus === ContentModerationStatus.locked,
    isFavorite: false,
    isMuted: false,
    paginator: {total: 0, start: 0, limit: 50},
    posts: [],
  };
};

/**
 * UserProfileEditScreen takes ProfilePublicData; the moderation API returns UserProfileUploadData.
 */
export const profilePublicDataFromUpload = (profile: UserProfileUploadData): ProfilePublicData | undefined => {
  if (!profile.header) {
    return undefined;
  }
  return {
    header: profile.header,
    realName: profile.realName,
    homeLocation: profile.homeLocation,
    roomNumber: profile.roomNumber,
    email: profile.email,
    about: profile.about,
    message: profile.message,
    dinnerTeam: profile.dinnerTeam,
    discordUsername: profile.discordUsername,
    isFavorite: false,
  };
};
