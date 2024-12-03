import {useTokenAuthMutation} from '../TokenAuthMutation';
import {AxiosResponse} from 'axios';
import {useSwiftarrQueryClient} from '../../Context/Contexts/SwiftarrQueryClientContext.ts';

interface ForumPostPinProps {
  postID: string;
  action: 'pin' | 'unpin';
}

export const useForumPostPinMutation = () => {
  const {ServerQueryClient} = useSwiftarrQueryClient();

  const PinQueryHandler = async ({postID, action}: ForumPostPinProps): Promise<AxiosResponse<void>> => {
    if (action === 'unpin') {
      return await ServerQueryClient.delete(`/forum/post/${postID}/pin`);
    }
    return await ServerQueryClient.post(`/forum/post/${postID}/pin`);
  };

  return useTokenAuthMutation(PinQueryHandler);
};
