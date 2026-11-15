import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useForumCacheReducer} from '#src/Hooks/Forum/useForumCacheReducer';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';

interface ForumPinHandlerProps {
  forumID: string;
  action: 'pin' | 'unpin';
  categoryID: string;
}

/**
 * Pin or unpin a forum thread within its category. Optimistically flips the cache in onMutate and
 * rolls back (plus invalidates) in onError at the hook level.
 */
export const useForumPinMutation = () => {
  const {apiPost, apiDelete} = useSwiftarrQueryClient();
  const {updatePinned, invalidateForum} = useForumCacheReducer();

  const ForumPinHandler = async ({forumID, action}: ForumPinHandlerProps) => {
    if (action === 'unpin') {
      return await apiDelete(`/forum/${forumID}/pin`);
    }
    return await apiPost(`/forum/${forumID}/pin`);
  };

  return useTokenAuthMutation(ForumPinHandler, {
    onMutate: ({forumID, categoryID, action}) => {
      updatePinned(forumID, categoryID, action === 'pin');
    },
    onError: (_error, {forumID, categoryID, action}) => {
      updatePinned(forumID, categoryID, action !== 'pin');
      invalidateForum(forumID, categoryID);
    },
  });
};
