import {FezData, PostData, PostDetailData, ReactionData} from '#src/Structs/ControllerStructs';

/**
 * Pure cache updaters for reaction changes. They live outside the cache reducer hooks so they can
 * be unit tested without a QueryClient.
 */

/** Replaces one chat post's reactions, leaving unread and post counts alone. */
export const applyFezPostReactions = (fez: FezData, postID: number, reactions: ReactionData[] | undefined): FezData => {
  if (!fez.members?.posts) {
    return fez;
  }
  return {
    ...fez,
    members: {
      ...fez.members,
      posts: fez.members.posts.map(post => (post.postID === postID ? {...post, reactions} : post)),
    },
  };
};

/** Copies the reaction fields of a forum post returned by Swiftarr onto a cached copy of it. */
export const applyPostReactions = (post: PostData, updatedPost: PostData): PostData => ({
  ...post,
  userLike: updatedPost.userLike,
  likeCount: updatedPost.likeCount,
  reactions: updatedPost.reactions,
});

/** Copies the reaction fields of a forum post returned by Swiftarr onto its cached detail. */
export const applyPostDetailReactions = (detail: PostDetailData, updatedPost: PostData): PostDetailData => ({
  ...detail,
  userLike: updatedPost.userLike,
  reactions: updatedPost.reactions,
});
