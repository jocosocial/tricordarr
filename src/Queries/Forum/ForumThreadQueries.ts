import {
  TokenAuthPaginationQueryOptionsTypeV2,
  useTokenAuthPaginationQuery,
  useTokenAuthQuery,
} from '#src/Queries/TokenAuthQuery';
import {ForumData, PostData} from '#src/Structs/ControllerStructs';

/**
 * Loads a forum thread, optionally starting at a specific post.
 *
 * `GET /forum/post/{id}/forum` looks up the post first and 404s when that post is
 * soft-deleted. `GET /forum/{forumID}?startPost={id}` looks up the thread by UUID
 * and uses the post ID only as a pagination offset — the same approach as the site UI.
 * Prefer both IDs whenever the caller has them (moderation View in Context).
 *
 * Like opening a Fez chat, this refetches on mount and window focus by default so the thread is always current.
 */
export const useForumThreadQuery = (
  forumID?: string,
  postID?: string,
  options: TokenAuthPaginationQueryOptionsTypeV2<ForumData> = {
    refetchOnWindowFocus: 'always',
    refetchOnMount: 'always',
  },
) => {
  if (!forumID && !postID) {
    throw new Error('Invalid usage of useForumThreadQuery()');
  }
  let endpoint = `/forum/${forumID}`;
  let queryParams: {startPost?: number} | undefined;
  if (forumID && postID) {
    queryParams = {startPost: Number(postID)};
  } else if (postID) {
    endpoint = `/forum/post/${postID}/forum`;
  }
  return useTokenAuthPaginationQuery<ForumData>(endpoint, options, queryParams);
};

export const useForumThreadPinnedPostsQuery = (forumID?: string) => {
  return useTokenAuthQuery<PostData[]>(`/forum/${forumID}/pinnedposts`, {
    enabled: !!forumID,
  });
};
