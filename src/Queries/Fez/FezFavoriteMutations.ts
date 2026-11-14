import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useFezCacheReducer} from '#src/Hooks/Fez/useFezCacheReducer';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';

interface FezFavoriteMutationProps {
  fezID: string;
  action: 'favorite' | 'unfavorite';
}

/**
 * Favorite or unfavorite a chat (Seamail, LFG, or Private Event). The favorite flag lives on the
 * per-user FezParticipant pivot, so only members can call this and unjoining implies unfavoriting.
 * Swiftarr returns no body, only a status, so the hook optimistically flips the cache in
 * onMutate and rolls back (plus invalidates) in onError. Living on the hook rather than in
 * per-call callbacks means the rollback still runs if the calling row unmounts or is recycled
 * mid-request.
 */
export const useFezFavoriteMutation = () => {
  const {apiPost, apiDelete} = useSwiftarrQueryClient();
  const {updateFavorite, invalidateFez} = useFezCacheReducer();

  const queryHandler = async ({fezID, action}: FezFavoriteMutationProps) => {
    if (action === 'unfavorite') {
      return await apiDelete(`/fez/${fezID}/favorite`);
    }
    return await apiPost(`/fez/${fezID}/favorite`);
  };

  return useTokenAuthMutation(queryHandler, {
    onMutate: ({fezID, action}) => {
      updateFavorite(fezID, action === 'favorite');
    },
    onError: (_error, {fezID, action}) => {
      updateFavorite(fezID, action !== 'favorite');
      invalidateFez(fezID);
    },
  });
};
