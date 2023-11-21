import {apiQueryImageData} from '../../libraries/Network/APIClient';
import {useAuth} from '../Context/Contexts/AuthContext';
import {useQuery} from '@tanstack/react-query';

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
