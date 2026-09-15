import {useQueryClient} from '@tanstack/react-query';

import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';
import {HuntCreateData, HuntPatchData, HuntPuzzlePatchData} from '#src/Structs/AdminControllerStructs';
import {HuntData, HuntListData} from '#src/Structs/ControllerStructs';

export const useCreateHuntMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();
  const queryClient = useQueryClient();

  const mutationFn = async (data: HuntCreateData) => {
    return await apiPost('/hunts/create', data);
  };

  return useTokenAuthMutation(mutationFn, {
    onSuccess: () => {
      HuntListData.getCacheKeys().forEach(key => queryClient.invalidateQueries({queryKey: key}));
    },
  });
};

interface PatchHuntProps {
  huntID: string;
  data: HuntPatchData;
}

export const usePatchHuntMutation = () => {
  const {ServerQueryClient} = useSwiftarrQueryClient();
  const queryClient = useQueryClient();

  const mutationFn = async ({huntID, data}: PatchHuntProps) => {
    return await ServerQueryClient.patch(`/hunts/${huntID}`, data);
  };

  return useTokenAuthMutation(mutationFn, {
    onSuccess: (_data, variables) => {
      HuntData.getCacheKeys(variables.huntID).forEach(key => queryClient.invalidateQueries({queryKey: key}));
    },
  });
};

interface PatchPuzzleProps {
  puzzleID: string;
  huntID: string;
  data: HuntPuzzlePatchData;
}

export const usePatchHuntPuzzleMutation = () => {
  const {ServerQueryClient} = useSwiftarrQueryClient();
  const queryClient = useQueryClient();

  const mutationFn = async ({puzzleID, data}: PatchPuzzleProps) => {
    return await ServerQueryClient.patch(`/hunts/puzzles/${puzzleID}`, data);
  };

  return useTokenAuthMutation(mutationFn, {
    onSuccess: (_data, variables) => {
      HuntData.getCacheKeys(variables.huntID).forEach(key => queryClient.invalidateQueries({queryKey: key}));
    },
  });
};

export const useDeleteHuntMutation = () => {
  const {apiDelete} = useSwiftarrQueryClient();
  const queryClient = useQueryClient();

  const mutationFn = async (huntID: string) => {
    return await apiDelete(`/hunts/${huntID}`);
  };

  return useTokenAuthMutation(mutationFn, {
    onSuccess: () => {
      HuntListData.getCacheKeys().forEach(key => queryClient.invalidateQueries({queryKey: key}));
    },
  });
};
