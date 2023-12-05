import {UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {useTokenAuthQuery} from '../TokenAuthQuery';

export const useUserMatchQuery = (searchQuery: string) => {
  return useTokenAuthQuery<UserHeader[]>({
    queryKey: [`/users/match/allnames/${searchQuery}`],
    enabled: searchQuery.length >= 2,
  });
};
