import {AxiosResponse} from 'axios';
import {useTokenAuthMutation} from '../TokenAuthMutation';
import {useSwiftarrQueryClient} from '../../Context/Contexts/SwiftarrQueryClientContext.ts';

interface ForumPinHandlerProps {
  forumID: string;
  action: 'pin' | 'unpin';
}

export const useForumPinMutation = () => {
  const {ServerQueryClient} = useSwiftarrQueryClient();

  const ForumPinHandler = async ({forumID, action}: ForumPinHandlerProps): Promise<AxiosResponse<void>> => {
    if (action === 'unpin') {
      return await ServerQueryClient.delete(`/forum/${forumID}/pin`);
    }
    return await ServerQueryClient.post(`/forum/${forumID}/pin`);
  };

  return useTokenAuthMutation(ForumPinHandler);
};
