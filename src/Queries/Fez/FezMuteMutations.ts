import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useFezCacheReducer} from '#src/Hooks/Fez/useFezCacheReducer';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';

interface FezMuteMutationProps {
  fezID: string;
  action: 'mute' | 'unmute';
}

/**
 * Mute or unmute a chat. Optimistically flips the cache in onMutate and rolls back (plus
 * invalidates) in onError at the hook level, so the rollback survives the calling row unmounting.
 */
export const useFezMuteMutation = () => {
  const {apiPost, apiDelete} = useSwiftarrQueryClient();
  const {updateMute, invalidateFez} = useFezCacheReducer();

  const queryHandler = async ({fezID, action}: FezMuteMutationProps) => {
    if (action === 'unmute') {
      return await apiDelete(`/fez/${fezID}/mute`);
    }
    return await apiPost(`/fez/${fezID}/mute`);
  };

  return useTokenAuthMutation(queryHandler, {
    onMutate: ({fezID, action}) => {
      updateMute(fezID, action === 'mute');
    },
    onError: (_error, {fezID, action}) => {
      updateMute(fezID, action !== 'mute');
      invalidateFez(fezID);
    },
  });
};
