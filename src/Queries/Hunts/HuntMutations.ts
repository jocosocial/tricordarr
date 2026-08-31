import {useQueryClient} from '@tanstack/react-query';
import {HttpStatusCode} from 'axios';

import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {getHuntCacheKeys, getHuntPuzzleCacheKeys, getHuntPuzzleQueryKey} from '#src/Queries/Hunts/HuntCacheKeys';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';
import {HuntPuzzleCallInResultData, HuntPuzzleDetailData} from '#src/Structs/ControllerStructs';

interface HuntPuzzleCallInMutationProps {
  puzzleID: string;
  huntID: string;
  answer: string;
}

const plaintextPostConfig = {
  headers: {'Content-Type': 'text/plain; charset=utf-8'},
};

const isCallInResult = (value: unknown): value is HuntPuzzleCallInResultData => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as HuntPuzzleCallInResultData).creationTime === 'string'
  );
};

/**
 * Submit a puzzle answer as `text/plain` (Swiftarr `PlaintextDecoder`).
 *
 * 201: new row — append to the puzzle cache, then invalidate the parent hunt only if correct.
 * 200: duplicate normalized guess — the existing row is already in callIns; do not append.
 * 409: already solved — invalidate puzzle + hunt so a stale form hides.
 */
export const useHuntPuzzleCallInMutation = () => {
  const {apiPost, queryKeyExtraData} = useSwiftarrQueryClient();
  const queryClient = useQueryClient();

  const mutationFn = async ({puzzleID, answer}: HuntPuzzleCallInMutationProps) => {
    return await apiPost<HuntPuzzleCallInResultData, string>(
      `/hunts/puzzles/${puzzleID}/callin`,
      answer,
      plaintextPostConfig,
    );
  };

  return useTokenAuthMutation(mutationFn, {
    onSuccess: (response, variables) => {
      if (response.status === HttpStatusCode.Created && isCallInResult(response.data)) {
        queryClient.setQueryData<HuntPuzzleDetailData>(
          getHuntPuzzleQueryKey(variables.puzzleID, queryKeyExtraData),
          old => (old ? {...old, callIns: [...old.callIns, response.data]} : old),
        );
      }
      if (isCallInResult(response.data) && response.data.correct) {
        getHuntCacheKeys({huntID: variables.huntID}).forEach(key => {
          queryClient.invalidateQueries({queryKey: key});
        });
      }
    },
    onSettled: (_data, error, variables) => {
      if (error?.response?.status === HttpStatusCode.Conflict) {
        getHuntPuzzleCacheKeys({puzzleID: variables.puzzleID}).forEach(key => {
          queryClient.invalidateQueries({queryKey: key});
        });
        getHuntCacheKeys({huntID: variables.huntID}).forEach(key => {
          queryClient.invalidateQueries({queryKey: key});
        });
      }
    },
  });
};
