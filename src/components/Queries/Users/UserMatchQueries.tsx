import {UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {useTokenAuthQuery} from '../TokenAuthQuery';

export const useUserMatchQuery = (searchQuery: string, enabled: boolean = true) => {
  return useTokenAuthQuery<UserHeader[]>({
    queryKey: [`/users/match/allnames/${searchQuery}`],
    enabled: enabled && searchQuery.length >= 2,
  });
};
