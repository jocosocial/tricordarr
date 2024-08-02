import {UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {useTokenAuthQuery} from '../TokenAuthQuery';
import axios from 'axios';

interface UserMatchQueryProps {
  searchQuery: string;
  favorers?: boolean;
  options?: {};
}

export const useUserMatchQuery = ({searchQuery, favorers, options}: UserMatchQueryProps) => {
  return useTokenAuthQuery<UserHeader[]>({
    queryKey: [`/users/match/allnames/${searchQuery}`],
    queryFn: async () => {
      const queryParams = {
        ...(favorers !== undefined && {favorers: favorers}),
      };
      const {data: responseData} = await axios.get<UserHeader[]>(`/users/match/allnames/${searchQuery}`, {
        params: queryParams,
      });
      return responseData;
    },
    enabled: searchQuery.length >= 2,
    ...options,
  });
};
