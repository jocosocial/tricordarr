import {UserRoleType} from '#src/Enums/UserRoleType';
import {useTokenAuthQuery} from '#src/Queries/TokenAuthQuery';
import {UserHeader} from '#src/Structs/ControllerStructs';

export const useUsersWithRoleQuery = ({role}: {role: UserRoleType}, options = {}) => {
  return useTokenAuthQuery<UserHeader[]>(`/admin/userroles/${role}`, options);
};
