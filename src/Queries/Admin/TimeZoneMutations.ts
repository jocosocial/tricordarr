import {useQueryClient} from '@tanstack/react-query';

import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';
import {TimeZoneChangeData} from '#src/Structs/ControllerStructs';

export const useReloadTimeZoneDataMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();
  const queryClient = useQueryClient();

  const mutationFn = async () => {
    return await apiPost('/admin/timezonechanges/reloadtzdata');
  };

  return useTokenAuthMutation(mutationFn, {
    onSuccess: () => {
      TimeZoneChangeData.getCacheKeys().forEach(key => queryClient.invalidateQueries({queryKey: key}));
    },
  });
};
