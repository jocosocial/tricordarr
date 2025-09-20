import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';

interface ForumPostPinProps {
  postID: string;
  action: 'pin' | 'unpin';
}

export const useForumPostPinMutation = () => {
  const {apiPost, apiDelete} = useSwiftarrQueryClient();

  const PinQueryHandler = async ({postID, action}: ForumPostPinProps) => {
    if (action === 'unpin') {
      return await apiDelete(`/forum/post/${postID}/pin`);
    }
    return await apiPost(`/forum/post/${postID}/pin`);
  };

  return useTokenAuthMutation(PinQueryHandler);
};
