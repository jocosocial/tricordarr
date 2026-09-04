import {useQueryClient} from '@tanstack/react-query';

import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';
import {RegistrationCodeStatsData} from '#src/Structs/AdminControllerStructs';
import {RegistrationCodeUserData} from '#src/Structs/ControllerStructs';

export const useAllocateDiscordRegCodeMutation = () => {
  const {apiGet} = useSwiftarrQueryClient();
  const queryClient = useQueryClient();

  const mutationFn = async (discordUsername: string) => {
    const response = await apiGet<RegistrationCodeUserData, undefined>(
      `/admin/regcodes/discord/allocate/${discordUsername}`,
    );
    return response.data;
  };

  return useTokenAuthMutation(mutationFn, {
    onSuccess: () => {
      RegistrationCodeStatsData.getCacheKeys().forEach(key => queryClient.invalidateQueries({queryKey: key}));
    },
  });
};
