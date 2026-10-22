import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useForumCacheReducer} from '#src/Hooks/Forum/useForumCacheReducer';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';

interface ForumRelationCreateProps {
  forumID: string;
  relationType: 'favorite' | 'mute';
  action: 'create' | 'delete';
  /** Category whose cached lists should reflect the change, if the thread is viewed through one. */
  categoryID?: string;
}

/**
 * Favorite or mute a forum thread. Optimistically flips the cache in onMutate and rolls back (plus
 * invalidates) in onError at the hook level, so the rollback survives the calling row unmounting
 * (e.g. unfavoriting from a ?favorite=true list drops the row immediately).
 */
export const useForumRelationMutation = () => {
  const {apiPost, apiDelete} = useSwiftarrQueryClient();
  const {updateFavorite, updateMute, invalidateForum} = useForumCacheReducer();

  const relationQueryHandler = async ({forumID, relationType, action}: ForumRelationCreateProps) => {
    if (action === 'delete') {
      return await apiDelete(`/forum/${forumID}/${relationType}`);
    }
    return await apiPost(`/forum/${forumID}/${relationType}`);
  };

  const applyRelation = (
    forumID: string,
    categoryID: string | undefined,
    relationType: 'favorite' | 'mute',
    value: boolean,
  ) => {
    if (relationType === 'favorite') {
      updateFavorite(forumID, categoryID, value);
    } else {
      updateMute(forumID, categoryID, value);
    }
  };

  return useTokenAuthMutation(relationQueryHandler, {
    onMutate: ({forumID, categoryID, relationType, action}) => {
      applyRelation(forumID, categoryID, relationType, action === 'create');
    },
    onError: (_error, {forumID, categoryID, relationType, action}) => {
      applyRelation(forumID, categoryID, relationType, action !== 'create');
      invalidateForum(forumID, categoryID);
    },
  });
};
