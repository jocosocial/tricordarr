import {useQueryClient} from '@tanstack/react-query';

import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';
import {KaraokeSongData, NoteCreateData} from '#src/Structs/ControllerStructs';

interface KaraokeFavoriteMutationVariables {
  songID: string;
  action: 'favorite' | 'unfavorite';
}

export const useKaraokeFavoriteMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();
  const queryClient = useQueryClient();

  const mutationFn = async ({songID, action}: KaraokeFavoriteMutationVariables) => {
    const endpoint = action === 'favorite' ? 'favorite' : 'favorite/remove';
    await apiPost(`/karaoke/${songID}/${endpoint}`);
  };

  const mutation = useTokenAuthMutation(mutationFn, {
    onSuccess: (_data, variables) => {
      const keys = KaraokeSongData.getCacheKeys(variables.songID);
      keys.forEach(key => queryClient.invalidateQueries({queryKey: key}));
    },
  });

  return mutation;
};

interface KaraokeLogPerformanceVariables {
  songID: string;
  note: NoteCreateData;
}

export const useKaraokeLogPerformanceMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();
  const queryClient = useQueryClient();

  const mutationFn = async ({songID, note}: KaraokeLogPerformanceVariables) => {
    await apiPost<unknown, NoteCreateData>(`/karaoke/${songID}/logperformance`, note);
  };

  const mutation = useTokenAuthMutation(mutationFn, {
    onSuccess: (_data, variables) => {
      const keys = KaraokeSongData.getCacheKeys(variables.songID);
      keys.forEach(key => queryClient.invalidateQueries({queryKey: key}));
    },
  });

  return mutation;
};
