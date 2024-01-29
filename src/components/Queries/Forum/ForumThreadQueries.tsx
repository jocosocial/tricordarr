import {useTokenAuthPaginationQuery, useTokenAuthQuery} from '../TokenAuthQuery';
import {ForumData, PostData} from '../../../libraries/Structs/ControllerStructs';

export const useForumThreadQuery = (forumID?: string, postID?: string) => {
  if (!forumID && !postID) {
    throw new Error('Invalid usage of useForumThreadQuery()');
  }
  let endpoint = `/forum/${forumID}`;
  if (postID) {
    endpoint = `/forum/post/${postID}/forum`;
  }
  return useTokenAuthPaginationQuery<ForumData>(endpoint);
};

export const useForumThreadPinnedPostsQuery = (forumID: string) => {
  return useTokenAuthQuery<PostData[]>({
    queryKey: [`/forum/${forumID}/pinnedposts`],
  });
};
