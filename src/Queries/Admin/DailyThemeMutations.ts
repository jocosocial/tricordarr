import {useQueryClient} from '@tanstack/react-query';

import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';
import {DailyThemeUploadData} from '#src/Structs/AdminControllerStructs';
import {DailyThemeData} from '#src/Structs/ControllerStructs';

export const useCreateDailyThemeMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();
  const queryClient = useQueryClient();

  const mutationFn = async (data: DailyThemeUploadData) => {
    return await apiPost('/admin/dailytheme/create', data);
  };

  return useTokenAuthMutation(mutationFn, {
    onSuccess: () => {
      DailyThemeData.getCacheKeys().forEach(key => queryClient.invalidateQueries({queryKey: key}));
    },
  });
};

interface EditDailyThemeProps {
  themeID: string;
  data: DailyThemeUploadData;
}

export const useEditDailyThemeMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();
  const queryClient = useQueryClient();

  const mutationFn = async ({themeID, data}: EditDailyThemeProps) => {
    return await apiPost(`/admin/dailytheme/${themeID}/edit`, data);
  };

  return useTokenAuthMutation(mutationFn, {
    onSuccess: () => {
      DailyThemeData.getCacheKeys().forEach(key => queryClient.invalidateQueries({queryKey: key}));
    },
  });
};

export const useDeleteDailyThemeMutation = () => {
  const {apiDelete} = useSwiftarrQueryClient();
  const queryClient = useQueryClient();

  const mutationFn = async (themeID: string) => {
    return await apiDelete(`/admin/dailytheme/${themeID}`);
  };

  return useTokenAuthMutation(mutationFn, {
    onSuccess: () => {
      DailyThemeData.getCacheKeys().forEach(key => queryClient.invalidateQueries({queryKey: key}));
    },
  });
};
