import {UserHeader} from '#src/Structs/ControllerStructs';
import {useTokenAuthQuery} from '#src/Queries/TokenAuthQuery';

export const useUserMutesQuery = (options = {}) => {
  return useTokenAuthQuery<UserHeader[]>('/users/mutes', options);
};
