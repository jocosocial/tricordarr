import {apiQueryImageData} from '../../libraries/Network/APIClient';
import {useAuth} from '../Context/Contexts/AuthContext';
import {useQueries, useQuery} from '@tanstack/react-query';
import {useConfig} from '../Context/Contexts/ConfigContext';

/**
 * Handler for retrieving images.
 */
export const useImageQuery = (path: string, enabled: boolean = true) => {
  const {isLoggedIn} = useAuth();
  const {appConfig} = useConfig();

  return useQuery({
    queryKey: [path],
    enabled: enabled && isLoggedIn && !!path,
    queryFn: apiQueryImageData,
    staleTime: 1000 * 60 * 60 * 4, // 4 Hours
    cacheTime: appConfig.apiClientConfig.cacheTime,
  });
};

/**
 * Handler for retrieving multiple images.
 * @param paths API URL paths to fetch
 * @param enabled Boolean of if the query should start life enabled.
 */
export const useImageQueries = (paths: string[], enabled: boolean = true) => {
  const {isLoggedIn} = useAuth();
  const {appConfig} = useConfig();

  return useQueries({
    queries: paths.map(path => {
      return {
        queryKey: [path],
        enabled: enabled && isLoggedIn && !!path,
        queryFn: apiQueryImageData,
        staleTime: 1000 * 60 * 60 * 4, // 4 Hours
        cacheTime: appConfig.apiClientConfig.cacheTime,
      };
    }),
  });
};
