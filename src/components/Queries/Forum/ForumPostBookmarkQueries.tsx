import {useTokenAuthMutation} from '../TokenAuthMutation';
import axios, {AxiosResponse} from 'axios/index';
import {LikeType} from '../../../libraries/Enums/LikeType';

interface ForumPostBookmarkProps {
  postID: string;
  action: 'create' | 'delete';
}

const bookmarkQueryHandler = async ({postID, action}: ForumPostBookmarkProps): Promise<AxiosResponse<void>> => {
  if (action === 'delete') {
    return await axios.delete(`/forum/post/${postID}/bookmark`);
  }
  return await axios.post(`/forum/post/${postID}/bookmark`);
};

export const useForumPostBookmarkMutation = () => {
  return useTokenAuthMutation(bookmarkQueryHandler);
};

interface ForumPostReactionProps {
  postID: string;
  reaction: LikeType;
  action: 'create' | 'delete';
}

const reactionQueryHandler = async ({
  postID,
  reaction,
  action,
}: ForumPostReactionProps): Promise<AxiosResponse<void>> => {
  if (action === 'delete') {
    return await axios.delete(`/forum/post/${postID}/${reaction}`);
  }
  return await axios.post(`/forum/post/${postID}/${reaction}`);
};

export const useForumPostReactionMutation = () => {
  return useTokenAuthMutation(reactionQueryHandler);
};
