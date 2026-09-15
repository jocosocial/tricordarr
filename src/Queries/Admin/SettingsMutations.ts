import {useQueryClient} from '@tanstack/react-query';

import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';
import {SettingsAdminData, SettingsUpdateData} from '#src/Structs/AdminControllerStructs';
import {UserNotificationData} from '#src/Structs/ControllerStructs';

export const useAdminSettingsUpdateMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();
  const queryClient = useQueryClient();

  const mutationFn = async (settings: SettingsUpdateData) => {
    return await apiPost('/admin/serversettings/update', settings);
  };

  return useTokenAuthMutation(mutationFn, {
    onSuccess: () => {
      SettingsAdminData.getCacheKeys()
        .concat(UserNotificationData.getCacheKeys())
        .forEach(key => queryClient.invalidateQueries({queryKey: key}));
    },
  });
};
