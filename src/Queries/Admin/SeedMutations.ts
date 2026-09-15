import {useQueryClient} from '@tanstack/react-query';

import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';
import {BoardgameData, KaraokeSongData} from '#src/Structs/ControllerStructs';

export const useReloadKaraokeMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();
  const queryClient = useQueryClient();

  const mutationFn = async () => {
    return await apiPost('/karaoke/reload');
  };

  return useTokenAuthMutation(mutationFn, {
    onSuccess: () => {
      KaraokeSongData.getCacheKeys().forEach(key => queryClient.invalidateQueries({queryKey: key}));
    },
  });
};

export const useReloadBoardgamesMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();
  const queryClient = useQueryClient();

  const mutationFn = async () => {
    return await apiPost('/boardgames/reload');
  };

  return useTokenAuthMutation(mutationFn, {
    onSuccess: () => {
      BoardgameData.getCacheKeys().forEach(key => queryClient.invalidateQueries({queryKey: key}));
    },
  });
};

export const useReloadNotificationsMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const mutationFn = async () => {
    return await apiPost('/admin/notifications/reload');
  };

  return useTokenAuthMutation(mutationFn);
};
