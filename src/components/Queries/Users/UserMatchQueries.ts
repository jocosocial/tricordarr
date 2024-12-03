import {UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {useTokenAuthQuery} from '../TokenAuthQuery';

interface UserMatchQueryProps {
  searchQuery: string;
  favorers?: boolean;
  options?: {};
}

export const useUserMatchQuery = ({searchQuery, favorers, options}: UserMatchQueryProps) => {
  return useTokenAuthQuery<UserHeader[]>(
    `/users/match/allnames/${searchQuery}`,
    {
      ...options,
      enabled: searchQuery.length >= 2,
    },
    {
      ...(favorers !== undefined && {favorers: favorers}),
    },
  );
};
