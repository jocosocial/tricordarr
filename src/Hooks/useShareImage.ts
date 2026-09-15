import FastImage from '@d11/react-native-fast-image';
import {Asset} from 'expo-asset';
import {EncodingType, File, Paths} from 'expo-file-system';
import {useCallback} from 'react';
import {Image} from 'react-native';
import * as mime from 'react-native-mime-types';
import Share from 'react-native-share';

import {createLogger} from '#src/Libraries/Logger';
import {AppImageMetaData, AppImageMode} from '#src/Types/AppImageMetaData';

const logger = createLogger('useShareImage.ts');

const isShareCancelled = (error: unknown) =>
  error instanceof Error && (/cancell?ed/i.test(error.message) || /did not share/i.test(error.message));

/**
 * Copies the image into the cache directory (required for Android FileProvider)
 * and opens the system share sheet.
 */
export const useShareImage = () => {
  const shareImage = useCallback(async (imageMeta: AppImageMetaData) => {
    const cacheFile = new File(Paths.cache, imageMeta.fileName);
    try {
      switch (imageMeta.mode) {
        case AppImageMode.data: {
          if (!imageMeta.dataURI) {
            throw new Error('No data URI to share');
          }
          const base64Data = imageMeta.dataURI.split(',')[1];
          if (!cacheFile.exists) {
            cacheFile.create({intermediates: true, overwrite: true});
          }
          cacheFile.write(base64Data, {encoding: EncodingType.Base64});
          break;
        }
        case AppImageMode.asset: {
          if (!imageMeta.assetSource) {
            throw new Error('Asset source is required to share an asset image');
          }
          const resolved = Image.resolveAssetSource(imageMeta.assetSource);
          if (!resolved?.uri) {
            throw new Error(`Could not resolve asset URI for ${imageMeta.fileName}`);
          }
          const type = mime.extension(imageMeta.mimeType) || 'jpg';
          const asset = new Asset({
            name: imageMeta.fileName.replace(/\.[^.]+$/, ''),
            type,
            uri: resolved.uri,
          });
          await asset.downloadAsync();
          if (!asset.localUri || !asset.localUri.includes(':')) {
            throw new Error(`Failed to materialize asset ${imageMeta.fileName}`);
          }
          await new File(asset.localUri).copy(cacheFile, {overwrite: true});
          break;
        }
        case AppImageMode.identicon:
        case AppImageMode.api: {
          let uriToShare = AppImageMetaData.getSourceURI(imageMeta);
          try {
            const cachePath = await FastImage.getCachePath({uri: uriToShare});
            if (cachePath) {
              uriToShare = `file://${cachePath}`;
            }
          } catch (error) {
            logger.warn('Failed to get image cache URI', error);
          }
          if (uriToShare.startsWith('http')) {
            await File.downloadFileAsync(uriToShare, cacheFile, {idempotent: true});
          } else {
            await new File(uriToShare).copy(cacheFile, {overwrite: true});
          }
          break;
        }
      }

      await Share.open({
        url: cacheFile.uri,
        type: imageMeta.mimeType,
        filename: imageMeta.fileName,
        failOnCancel: false,
      });
    } catch (error) {
      if (isShareCancelled(error)) {
        return;
      }
      throw error;
    }
  }, []);

  return shareImage;
};
