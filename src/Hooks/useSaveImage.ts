import FastImage from '@d11/react-native-fast-image';
import {useCallback} from 'react';

import {createLogger} from '#src/Libraries/Logger';
import {
  saveAssetImageToLocal,
  saveImageDataURIToCameraRoll,
  saveImageURIToLocal,
} from '#src/Libraries/Storage/ImageStorage';
import {AppImageMetaData, AppImageMode} from '#src/Types/AppImageMetaData';

const logger = createLogger('useSaveImage.ts');

/**
 * Saves an AppImageMetaData image to the device camera roll, branching on
 * the image's source mode.
 */
export const useSaveImage = () => {
  const saveImage = useCallback(async (imageMeta: AppImageMetaData) => {
    switch (imageMeta.mode) {
      case AppImageMode.data:
        await saveImageDataURIToCameraRoll(imageMeta);
        break;
      case AppImageMode.asset:
        await saveAssetImageToLocal(imageMeta);
        break;
      case AppImageMode.identicon: {
        if (!imageMeta.identiconURI) {
          throw Error('No identicon URI to save');
        }
        await saveImageURIToLocal(imageMeta.fileName, imageMeta.identiconURI);
        break;
      }
      case AppImageMode.api: {
        let cacheURI: string | undefined;
        try {
          const cachePath = await FastImage.getCachePath({uri: imageMeta.fullURI});
          if (cachePath) {
            cacheURI = `file://${cachePath}`;
          }
        } catch (error) {
          logger.warn('Failed to get image cache URI', error);
        }
        const uriToSave = cacheURI ?? imageMeta.fullURI;
        if (!uriToSave) {
          throw Error('No image URI to save');
        }
        await saveImageURIToLocal(imageMeta.fileName, uriToSave);
        break;
      }
    }
  }, []);

  return saveImage;
};
