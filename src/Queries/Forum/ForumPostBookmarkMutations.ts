import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {LikeType} from '#src/Enums/LikeType';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';

interface ForumPostBookmarkProps {
  postID: string;
  action: 'create' | 'delete';
}

export const useForumPostBookmarkMutation = () => {
  const {apiPost, apiDelete} = useSwiftarrQueryClient();
  const bookmarkQueryHandler = async ({postID, action}: ForumPostBookmarkProps) => {
    if (action === 'delete') {
      return await apiDelete(`/forum/post/${postID}/bookmark`);
    }
    return await apiPost(`/forum/post/${postID}/bookmark`);
  };
  return useTokenAuthMutation(bookmarkQueryHandler);
};

interface ForumPostReactionProps {
  postID: string;
  reaction: LikeType;
  action: 'create' | 'delete';
}

export const useForumPostReactionMutation = () => {
  const {apiPost, apiDelete} = useSwiftarrQueryClient();

  const reactionQueryHandler = async ({postID, reaction, action}: ForumPostReactionProps) => {
    if (action === 'delete') {
      return await apiDelete(`/forum/post/${postID}/${reaction}`);
    }
    return await apiPost(`/forum/post/${postID}/${reaction}`);
  };

  return useTokenAuthMutation(reactionQueryHandler);
};
