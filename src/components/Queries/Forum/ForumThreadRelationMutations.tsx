import {useTokenAuthMutation} from '../TokenAuthMutation';
import axios, {AxiosResponse} from 'axios';

interface ForumRelationCreateProps {
  forumID: string;
  relationType: 'favorite' | 'mute';
  action: 'create' | 'delete';
}

const relationQueryHandler = async ({
  forumID,
  relationType,
  action,
}: ForumRelationCreateProps): Promise<AxiosResponse<void>> => {
  if (action === 'delete') {
    return await axios.delete(`/forum/${forumID}/${relationType}`);
  }
  return await axios.post(`/forum/${forumID}/${relationType}`);
};

export const useForumRelationMutation = () => {
  return useTokenAuthMutation(relationQueryHandler);
};
