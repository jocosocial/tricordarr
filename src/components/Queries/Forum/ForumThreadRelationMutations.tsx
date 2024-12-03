import {useTokenAuthMutation} from '../TokenAuthMutation';
import {AxiosResponse} from 'axios';
import {useSwiftarrQueryClient} from '../../Context/Contexts/SwiftarrQueryClientContext.ts';

interface ForumRelationCreateProps {
  forumID: string;
  relationType: 'favorite' | 'mute';
  action: 'create' | 'delete';
}

export const useForumRelationMutation = () => {
  const {ServerQueryClient} = useSwiftarrQueryClient();

  const relationQueryHandler = async ({
    forumID,
    relationType,
    action,
  }: ForumRelationCreateProps): Promise<AxiosResponse<void>> => {
    if (action === 'delete') {
      return await ServerQueryClient.delete(`/forum/${forumID}/${relationType}`);
    }
    return await ServerQueryClient.post(`/forum/${forumID}/${relationType}`);
  };

  return useTokenAuthMutation(relationQueryHandler);
};
