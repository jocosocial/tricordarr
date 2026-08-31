import {useTokenAuthQuery} from '#src/Queries/TokenAuthQuery';
import {RegistrationCodeStatsData} from '#src/Structs/AdminControllerStructs';
import {RegistrationCodeUserData, UserHeader} from '#src/Structs/ControllerStructs';

export const useRegCodeForUserQuery = ({userID}: {userID: string}) => {
  return useTokenAuthQuery<RegistrationCodeUserData>(`/admin/regcodes/findbyuser/${userID}`);
};

export const useRegCodeStatsQuery = (options = {}) => {
  return useTokenAuthQuery<RegistrationCodeStatsData>('/admin/regcodes/stats', options);
};

export const useUserForRegCodeQuery = ({regCode}: {regCode: string}, options?: {enabled?: boolean}) => {
  return useTokenAuthQuery<UserHeader[]>(`/admin/regcodes/find/${regCode.toLowerCase()}`, {
    enabled: (options?.enabled ?? true) && regCode.length >= 6,
    ...options,
  });
};
