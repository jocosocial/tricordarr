import {useQuery} from '@tanstack/react-query';
import axios from 'axios';

import {joinUrl} from '#src/Libraries/UrlParser';

/**
 * The code of conduct of an explicit server, independent of the active session.
 */
export const useExplicitServerConduct = (serverUrl: string) =>
  useQuery<string>({
    queryKey: ['explicit-server-conduct', serverUrl],
    gcTime: 0,
    queryFn: async () => (await axios.get<string>(joinUrl(serverUrl, '/public/codeofconduct.md'))).data,
  });
