import {isWellFormed, normalized} from '#src/Libraries/RegistrationCode';
import {useTokenAuthQuery} from '#src/Queries/TokenAuthQuery';
import {RegistrationCodeStatsData} from '#src/Structs/AdminControllerStructs';
import {RegistrationCodeUserData, UserHeader} from '#src/Structs/ControllerStructs';

export const useRegCodeForUserQuery = ({userID}: {userID: string}) => {
  return useTokenAuthQuery<RegistrationCodeUserData>(`/admin/regcodes/findbyuser/${userID}`);
};

export const useRegCodeStatsQuery = (options = {}) => {
  return useTokenAuthQuery<RegistrationCodeStatsData>('/admin/regcodes/stats', options);
};

/**
 * Looks up accounts associated with a registration code.
 * Disabled until `regCode` is well-formed (6 alphanumeric characters, optional spaces).
 */
export const useUserForRegCodeQuery = ({regCode}: {regCode: string}, options?: {enabled?: boolean}) => {
  const code = normalized(regCode);
  return useTokenAuthQuery<UserHeader[]>(`/admin/regcodes/find/${encodeURIComponent(code)}`, {
    ...options,
    enabled: (options?.enabled ?? true) && isWellFormed(regCode),
  });
};
