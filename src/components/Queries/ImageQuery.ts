import {useAuth} from '../Context/Contexts/AuthContext.ts';
import {useConfig} from '../Context/Contexts/ConfigContext.ts';
import {useOpenQuery} from './OpenQuery.ts';
import {ImageQueryData} from '../../Libraries/Types/index.ts';
import {CacheManager} from '@georstat/react-native-image-cache';
import {useSwiftarrQueryClient} from '../Context/Contexts/SwiftarrQueryClientContext.ts';

/**
 * Handler for retrieving images.
 */
export const useImageQuery = (path: string, enabled: boolean = true) => {
  const {isLoggedIn} = useAuth();
  const {appConfig} = useConfig();
  const {serverUrl} = useSwiftarrQueryClient();

  return useOpenQuery<ImageQueryData>(path, {
    enabled: enabled && isLoggedIn && !!path,
    queryFn: async (): Promise<ImageQueryData> => {
      let url = `${serverUrl}/${appConfig.urlPrefix}/${path}`;
      const base64Data = await CacheManager.prefetchBlob(url);

      const fileName = path.split('/').pop();
      if (!fileName) {
        throw Error(`Unable to determine fileName from query: ${path}`);
      }

      if (!base64Data) {
        throw Error(`Unable to determine base64Data from query: ${path}`);
      }

      return {
        base64: base64Data,
        mimeType: 'image',
        dataURI: `data:image;base64,${base64Data}`,
        fileName: fileName,
      };
    },
    meta: {
      noDehydrate: true,
    },
    staleTime: appConfig.apiClientConfig.imageStaleTime,
  });
};
