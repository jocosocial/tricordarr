import axios, {AxiosResponse} from 'axios';
import {useTokenAuthMutation} from '../TokenAuthMutation';

interface ForumPinHandlerProps {
  forumID: string;
  action: 'pin' | 'unpin';
}

const ForumPinHandler = async ({forumID, action}: ForumPinHandlerProps): Promise<AxiosResponse<void>> => {
  if (action === 'unpin') {
    return await axios.delete(`/forum/${forumID}/pin`);
  }
  return await axios.post(`/forum/${forumID}/pin`);
};

export const useForumPinMutation = () => {
  return useTokenAuthMutation(ForumPinHandler);
};
