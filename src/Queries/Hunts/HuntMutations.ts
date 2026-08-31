import {useQueryClient} from '@tanstack/react-query';
import {AxiosRequestConfig} from 'axios';

import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';
import {HuntPuzzleCallInResultData, HuntPuzzleDetailData} from '#src/Structs/ControllerStructs';

interface HuntPuzzleCallInMutationProps {
  puzzleID: string;
  huntID: string;
  answer: string;
}

/**
 * Submit a puzzle answer. Unlike typical JSON mutations this posts `text/plain`
 * (Swiftarr decodes the body with `PlaintextDecoder`) and the response is the
 * call-in result rather than an empty status. Cache invalidation lives on the
 * mutation so callers do not have to remember hunt/puzzle key prefixes.
 */
export const useHuntPuzzleCallInMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();
  const queryClient = useQueryClient();

  const mutationFn = async ({puzzleID, answer}: HuntPuzzleCallInMutationProps) => {
    const config: AxiosRequestConfig = {
      headers: {'Content-Type': 'text/plain'},
      // Axios will JSON-encode strings when it thinks the body is JSON.
      transformRequest: [(data: string) => data],
    };
    return await apiPost<HuntPuzzleCallInResultData, string>(`/hunts/puzzles/${puzzleID}/callin`, answer, config);
  };

  return useTokenAuthMutation(mutationFn, {
    onSuccess: (_data, variables) => {
      HuntPuzzleDetailData.getCacheKeys(variables.puzzleID, variables.huntID).forEach(key => {
        queryClient.invalidateQueries({queryKey: key});
      });
    },
  });
};
