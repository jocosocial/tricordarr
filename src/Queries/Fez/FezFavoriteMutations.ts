import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';

interface FezFavoriteMutationProps {
  fezID: string;
  action: 'favorite' | 'unfavorite';
}

/**
 * Favorite or unfavorite a chat (Seamail, LFG, or Private Event). The favorite flag lives on the
 * per-user FezParticipant pivot, so only members can call this and unjoining implies unfavoriting.
 * Swiftarr returns no body, only a status, so callers optimistically flip the cache themselves
 * (see useFezCacheReducer's updateFavorite).
 */
export const useFezFavoriteMutation = () => {
  const {apiPost, apiDelete} = useSwiftarrQueryClient();

  const queryHandler = async ({fezID, action}: FezFavoriteMutationProps) => {
    if (action === 'unfavorite') {
      return await apiDelete(`/fez/${fezID}/favorite`);
    }
    return await apiPost(`/fez/${fezID}/favorite`);
  };

  return useTokenAuthMutation(queryHandler);
};
