import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
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
