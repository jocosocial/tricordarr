import {apiQueryImageDataV2} from '../../libraries/Network/APIClient';
import {useAuth} from '../Context/Contexts/AuthContext';
import {useQuery} from '@tanstack/react-query';
import {useConfig} from '../Context/Contexts/ConfigContext';

/**
 * Handler for retrieving images.
 */
export const useImageQuery = (path: string, enabled: boolean = true) => {
  const {isLoggedIn} = useAuth();

  return useQuery({
    queryKey: [path],
    enabled: enabled && isLoggedIn && !!path,
    queryFn: apiQueryImageDataV2,
    meta: {
      noDehydrate: true,
    },
  });
};
