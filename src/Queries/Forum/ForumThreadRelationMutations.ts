import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';

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
    return await apiPost(`/forum/${forumID}/${relationType}`);
  };

  return useTokenAuthMutation(relationQueryHandler);
};
