import {useTokenAuthMutation} from '../TokenAuthMutation';
import axios, {AxiosResponse} from 'axios/index';

interface ForumPostPinProps {
  postID: string;
  action: 'pin' | 'unpin';
}

const PinQueryHandler = async ({postID, action}: ForumPostPinProps): Promise<AxiosResponse<void>> => {
  if (action === 'unpin') {
    return await axios.delete(`/forum/post/${postID}/pin`);
  }
  return await axios.post(`/forum/post/${postID}/pin`);
};

export const useForumPostPinMutation = () => {
  return useTokenAuthMutation(PinQueryHandler);
};
