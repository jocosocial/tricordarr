import {useTokenAuthPaginationQuery, useTokenAuthQuery} from '#src/Queries/TokenAuthQuery';
import {ForumData, PostData} from '../../../Libraries/Structs/ControllerStructs';

export const useForumThreadQuery = (forumID?: string, postID?: string, options = {}) => {
  if (!forumID && !postID) {
    throw new Error('Invalid usage of useForumThreadQuery()');
  }
  let endpoint = `/forum/${forumID}`;
  if (postID) {
    endpoint = `/forum/post/${postID}/forum`;
  }
  return useTokenAuthPaginationQuery<ForumData>(endpoint, options);
};

export const useForumThreadPinnedPostsQuery = (forumID: string) => {
  return useTokenAuthQuery<PostData[]>(`/forum/${forumID}/pinnedposts`);
};
