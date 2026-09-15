import FastImage, {type Source as FastImageSource} from '@d11/react-native-fast-image';
import {useEffect, useState} from 'react';

import {createLogger} from '#src/Libraries/Logger';

const logger = createLogger('useCachedImageSource.ts');

/**
 * Resolves a remote image URI to FastImage's local cache file when one exists,
 * so FastImage renders from disk instead of revalidating the original URL and
 * triggering another GET for an image already downloaded. Falls back to the
 * remote URI itself on a cache miss (FastImage downloads and caches it normally)
 * or while the cache lookup is in flight.
 */
export const useCachedImageSource = (uri?: string): FastImageSource | undefined => {
  const [source, setSource] = useState<FastImageSource | undefined>(uri ? {uri} : undefined);

  useEffect(() => {
    if (!uri) {
      setSource(undefined);
      return;
    }
    setSource({uri});
    let cancelled = false;
    FastImage.getCachePath({uri})
      .then(cachePath => {
        if (!cancelled && cachePath) {
          setSource({uri: `file://${cachePath}`});
        }
      })
      .catch(error => {
        logger.warn('Failed to get image cache path', error);
      });
    return () => {
      cancelled = true;
    };
  }, [uri]);

  return source;
};
