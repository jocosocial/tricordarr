import {apiQueryImageDataV2} from '../../libraries/Network/APIClient';
import {useAuth} from '../Context/Contexts/AuthContext';
import {useConfig} from '../Context/Contexts/ConfigContext.ts';
import {useOpenQuery} from './OpenQuery.ts';
import {ImageQueryData} from '../../libraries/Types';

/**
 * Handler for retrieving images.
 */
export const useImageQuery = (path: string, enabled: boolean = true) => {
  const {isLoggedIn} = useAuth();
  const {appConfig} = useConfig();

  return useOpenQuery<ImageQueryData, readonly string[]>(path, {
    enabled: enabled && isLoggedIn && !!path,
    queryFn: apiQueryImageDataV2,
    meta: {
      noDehydrate: true,
    },
    staleTime: appConfig.apiClientConfig.imageStaleTime,
  });
};
