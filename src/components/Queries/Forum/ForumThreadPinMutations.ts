import {useTokenAuthMutation} from '../TokenAuthMutation.ts';
import {useSwiftarrQueryClient} from '../../Context/Contexts/SwiftarrQueryClientContext.ts';

interface ForumPinHandlerProps {
  forumID: string;
  action: 'pin' | 'unpin';
}

export const useForumPinMutation = () => {
  const {apiPost, apiDelete} = useSwiftarrQueryClient();

  const ForumPinHandler = async ({forumID, action}: ForumPinHandlerProps) => {
    if (action === 'unpin') {
      return await apiDelete(`/forum/${forumID}/pin`);
    }
    return await apiPost(`/forum/${forumID}/pin`);
  };

  return useTokenAuthMutation(ForumPinHandler);
};
