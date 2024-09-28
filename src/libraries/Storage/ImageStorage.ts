import {ImageQueryData} from '../Types';
import RNFS from 'react-native-fs';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import * as mime from 'react-native-mime-types';
import {CacheManager} from '@georstat/react-native-image-cache';
import {Dirs} from 'react-native-file-access';

const extensionRegExp = new RegExp('\\.', 'i');

const getImageDestinationPath = (fileName: string, mimeType: string) => {
  let destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
  if (!extensionRegExp.test(fileName)) {
    destPath = `${destPath}.${mime.extension(mimeType)}`;
  }
  return destPath;
};

export const saveImageToLocal = async (imageData: ImageQueryData) => {
  let destPath = getImageDestinationPath(imageData.fileName, imageData.mimeType);
  if (!imageData.base64) {
    throw Error(`No data to save to file ${destPath}`);
  }
  console.log('[ImageStorage.ts] Writing data to', destPath, imageData.mimeType);
  await RNFS.writeFile(destPath, imageData.base64, 'base64');
  const cameraRollSaveResult = await CameraRoll.save(destPath, {
    type: 'photo',
    album: 'Tricordarr',
  });
  await RNFS.unlink(destPath);
  console.log('[ImageStorage.ts] Saved to camera roll at', cameraRollSaveResult);
  return cameraRollSaveResult;
};

export const configureImageCache = () => {
  CacheManager.config = {
    baseDir: `${Dirs.CacheDir}/images_cache/`,
    blurRadius: 15,
    cacheLimit: 0,
    maxRetries: 3 /* optional, if not provided defaults to 0 */,
    retryDelay: 3000 /* in milliseconds, optional, if not provided defaults to 0 */,
    sourceAnimationDuration: 1000,
    thumbnailAnimationDuration: 1000,
  };
};
