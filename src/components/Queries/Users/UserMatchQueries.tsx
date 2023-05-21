import {useQuery} from '@tanstack/react-query';
import {UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {useAuth} from '../../Context/Contexts/AuthContext';

export const useUserMatchQuery = (searchQuery: string) => {
  const {isLoggedIn} = useAuth();
  return useQuery<UserHeader[]>({
    queryKey: [`/users/match/allnames/${searchQuery}`],
    enabled: isLoggedIn && searchQuery.length >= 2,
  });
};
