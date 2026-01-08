import {CacheManager} from '@georstat/react-native-image-cache';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useOpenQuery} from '#src/Queries/OpenQuery';
import {ImageQueryData} from '#src/Types';

/**
 * Handler for retrieving images.
 */
export const useImageQuery = (path: string, enabled: boolean = true) => {
  const {isLoggedIn} = useSession();
  const {appConfig} = useConfig();
  const {serverUrl} = useSwiftarrQueryClient();

  return useOpenQuery<ImageQueryData>(path, {
    enabled: enabled && isLoggedIn && !!path,
    queryFn: async (): Promise<ImageQueryData> => {
      let url = `${serverUrl}/${appConfig.urlPrefix}/${path}`;
      const base64Data = await CacheManager.prefetchBlob(url);

      // Remove query parameters before extracting filename
      const pathWithoutQuery = path.split('?')[0];
      const fileName = pathWithoutQuery.split('/').pop();
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
