import {useTokenAuthMutation} from '../TokenAuthMutation';
import {useSwiftarrQueryClient} from '../../Context/Contexts/SwiftarrQueryClientContext.ts';

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
