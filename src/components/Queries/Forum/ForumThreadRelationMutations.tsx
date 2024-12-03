import {useTokenAuthMutation} from '../TokenAuthMutation';
import {useSwiftarrQueryClient} from '../../Context/Contexts/SwiftarrQueryClientContext.ts';

interface ForumRelationCreateProps {
  forumID: string;
  relationType: 'favorite' | 'mute';
  action: 'create' | 'delete';
}

export const useForumRelationMutation = () => {
  const {apiPost, apiDelete} = useSwiftarrQueryClient();

  const relationQueryHandler = async ({forumID, relationType, action}: ForumRelationCreateProps) => {
    if (action === 'delete') {
      return await apiDelete(`/forum/${forumID}/${relationType}`);
    }
    // return await ServerQueryClient.post(`/forum/${forumID}/${relationType}`);
    return await apiPost({url: `/forum/${forumID}/${relationType}`});
  };

  return useTokenAuthMutation(relationQueryHandler);
};
