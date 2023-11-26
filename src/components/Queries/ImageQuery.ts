import {apiQueryImageData} from '../../libraries/Network/APIClient';
import {useAuth} from '../Context/Contexts/AuthContext';
import {useQueries, useQuery} from '@tanstack/react-query';

/**
 * Handler for retrieving images.
 */
export const useImageQuery = (path: string, enabled: boolean = true) => {
  const {isLoggedIn} = useAuth();
  return useQuery({
    queryKey: [path],
    enabled: enabled && isLoggedIn && !!path,
    queryFn: apiQueryImageData,
  });
};

/**
 * Handler for retrieving multiple images.
 * @param paths API URL paths to fetch
 * @param enabled Boolean of if the query should start life enabled.
 */
export const useImageQueries = (paths: string[], enabled: boolean = true) => {
  const {isLoggedIn} = useAuth();
  return useQueries({
    queries: paths.map(path => {
      return {
        queryKey: [path],
        enabled: enabled && isLoggedIn && !!path,
        queryFn: apiQueryImageData,
      };
    }),
  });
};
