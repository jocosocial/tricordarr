import {useQueryClient} from '@tanstack/react-query';

import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {getHuntCacheKeys, getHuntPuzzleCacheKeys} from '#src/Queries/Hunts/HuntCacheKeys';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';
import {HuntPuzzleCallInResultData} from '#src/Structs/ControllerStructs';

interface HuntPuzzleCallInMutationProps {
  puzzleID: string;
  huntID: string;
  answer: string;
}

const plaintextPostConfig = {
  headers: {'Content-Type': 'text/plain; charset=utf-8'},
};

/**
 * Submit a puzzle answer as `text/plain` (Swiftarr `PlaintextDecoder`).
 *
 * Always invalidate puzzle + hunt on settle. 201 (new), 200 (duplicate, which can
 * still be a correct answer), 409 (already solved), and a lost response after the
 * server wrote a row all need a refetch — status-branching `setQueryData` misses
 * the 200-with-correct retry path.
 */
export const useHuntPuzzleCallInMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();
  const queryClient = useQueryClient();

  const mutationFn = async ({puzzleID, answer}: HuntPuzzleCallInMutationProps) => {
    return await apiPost<HuntPuzzleCallInResultData, string>(
      `/hunts/puzzles/${puzzleID}/callin`,
      answer,
      plaintextPostConfig,
    );
  };

  return useTokenAuthMutation(mutationFn, {
    onSettled: (_data, _error, variables) => {
      getHuntPuzzleCacheKeys({puzzleID: variables.puzzleID}).forEach(queryKey => {
        queryClient.invalidateQueries({queryKey});
      });
      getHuntCacheKeys({huntID: variables.huntID}).forEach(queryKey => {
        queryClient.invalidateQueries({queryKey});
      });
    },
  });
};
