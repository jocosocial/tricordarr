import {useTokenAuthMutation} from '../TokenAuthMutation';
import {AxiosResponse} from 'axios';
import {LikeType} from '../../../libraries/Enums/LikeType';
import {useSwiftarrQueryClient} from '../../Context/Contexts/SwiftarrQueryClientContext.ts';

interface ForumPostBookmarkProps {
  postID: string;
  action: 'create' | 'delete';
}

export const useForumPostBookmarkMutation = () => {
  const {ServerQueryClient} = useSwiftarrQueryClient();
  const bookmarkQueryHandler = async ({postID, action}: ForumPostBookmarkProps): Promise<AxiosResponse<void>> => {
    if (action === 'delete') {
      return await ServerQueryClient.delete(`/forum/post/${postID}/bookmark`);
    }
    return await ServerQueryClient.post(`/forum/post/${postID}/bookmark`);
  };
  return useTokenAuthMutation(bookmarkQueryHandler);
};

interface ForumPostReactionProps {
  postID: string;
  reaction: LikeType;
  action: 'create' | 'delete';
}

export const useForumPostReactionMutation = () => {
  const {ServerQueryClient} = useSwiftarrQueryClient();

  const reactionQueryHandler = async ({
    postID,
    reaction,
    action,
  }: ForumPostReactionProps): Promise<AxiosResponse<void>> => {
    if (action === 'delete') {
      return await ServerQueryClient.delete(`/forum/post/${postID}/${reaction}`);
    }
    return await ServerQueryClient.post(`/forum/post/${postID}/${reaction}`);
  };

  return useTokenAuthMutation(reactionQueryHandler);
};
