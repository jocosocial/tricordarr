import {CacheManager} from '@georstat/react-native-image-cache';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {Dirs, FileSystem} from 'react-native-file-access';
import RNFS from 'react-native-fs';
import * as mime from 'react-native-mime-types';

import {ImageQueryData} from '#src/Types';
import {AppImageMetaData} from '#src/Types/AppImageMetaData';

const extensionRegExp = new RegExp('\\.', 'i');

const getImageDestinationPath = (fileName: string, mimeType: string) => {
  let destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
  if (!extensionRegExp.test(fileName)) {
    destPath = `${destPath}.${mime.extension(mimeType)}`;
  }
  return destPath;
};

export const saveImageToCameraRoll = async (localURI: string) => {
  console.log('[ImageStorage.ts] Saving image to camera roll from', localURI);
  const response = await CameraRoll.saveAsset(localURI, {
    type: 'photo',
    album: 'Tricordarr',
  });
  return response;
};

export const saveImageURIToLocal = async (fileName: string, imageURI: string) => {
  console.log(`[ImageStorage.ts] Saving image to ${fileName} from ${imageURI}`);
  const cachePath = `${RNFS.CachesDirectoryPath}/${fileName}`;
  if (imageURI.startsWith('http')) {
    console.log('[ImageStorage.ts] Downloading file from', imageURI, 'to', cachePath);
    const result = await RNFS.downloadFile({
      fromUrl: imageURI,
      toFile: cachePath,
    }).promise;
    if (result.statusCode !== 200) {
      throw new Error(`Failed to download file: HTTP ${result.statusCode}`);
    }
  } else {
    console.log('[ImageStorage.ts] Copying file from', imageURI, 'to', cachePath);
    await RNFS.copyFile(imageURI, cachePath);
  }
  await saveImageToCameraRoll(cachePath);
  await RNFS.unlink(cachePath);
  console.log('[ImageStorage.ts] Saved to camera roll');
};

/**
 * @deprecated this is brand new but deprecated because these functions are insane
 */
export const saveImageDataURIToCameraRoll = async (imageData: AppImageMetaData) => {
  let destPath = getImageDestinationPath(imageData.fileName, imageData.mimeType);
  const dataURI = imageData.dataURI;
  if (!dataURI) {
    throw Error(`No data to save to file ${destPath}`);
  }
  console.log('[ImageStorage.ts] Writing data to', destPath, imageData.mimeType);
  await RNFS.writeFile(destPath, dataURI, 'base64');
  const cameraRollSaveResult = await CameraRoll.save(destPath, {
    type: 'photo',
    album: 'Tricordarr',
  });
  await RNFS.unlink(destPath);
  console.log('[ImageStorage.ts] Saved to camera roll at', cameraRollSaveResult);
  return cameraRollSaveResult;
};

/**
 * @deprecated use saveImageURIToLocal instead
 */
export const saveImageQueryToLocal = async (imageData: ImageQueryData) => {
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

/**
 * Saves an image to the device's camera roll.
 * Handles different types of dataURI sources:
 * - file:// URIs: Copies the file to a temporary location
 * - http/https URIs: Downloads the file to a temporary location
 * - asset:// URIs: Copies bundled assets to a temporary location
 * - data: URIs: Writes base64 data to a temporary location
 *
 * @deprecated doesnt work
 * @param image The APIImageV2Data object containing the image information
 * @returns Promise<CameraRoll.Asset> The camera roll save result
 * @throws Error if the dataURI is not provided or unsupported format
 */
export const newSaveImage = async (image: AppImageMetaData) => {
  // Always get the proper destination path for the file
  let destPath = getImageDestinationPath(image.fileName, image.mimeType);

  if (!image.dataURI) {
    throw new Error(`No dataURI provided for image ${image.fileName}`);
  }

  const dataURI = image.dataURI;

  try {
    // Handle different types of dataURI
    if (dataURI.startsWith('file://')) {
      // Copy file from local file system to destination
      console.log('[ImageStorage.ts] Copying file from', dataURI, 'to', destPath);
      await RNFS.copyFile(dataURI, destPath);
    } else if (dataURI.startsWith('http://') || dataURI.startsWith('https://')) {
      // Download file from URL to destination
      console.log('[ImageStorage.ts] Downloading file from', dataURI, 'to', destPath);
      const result = await RNFS.downloadFile({
        fromUrl: dataURI,
        toFile: destPath,
      }).promise;

      if (result.statusCode !== 200) {
        throw new Error(`Failed to download file: HTTP ${result.statusCode}`);
      }
    } else if (dataURI.startsWith('asset://') || dataURI.includes('asset_')) {
      // Handle bundled assets - these are typically referenced by name like 'asset_mainview_day'
      // The fromAsset function in APIImageV2Data resolves these to actual file paths
      // so we can treat them like regular file:// URIs
      console.log('[ImageStorage.ts] Handling bundled asset:', dataURI);
      await RNFS.copyFile(dataURI, destPath);
    } else if (dataURI.startsWith('data:')) {
      // Handle base64 data URI
      console.log('[ImageStorage.ts] Writing base64 data to', destPath);
      const base64Data = dataURI.split(',')[1]; // Remove the data:image/jpeg;base64, prefix
      await RNFS.writeFile(destPath, base64Data, 'base64');
    } else {
      throw new Error(`Unsupported dataURI format: ${dataURI.substring(0, 50)}...`);
    }

    // Always save to camera roll and return the response
    console.log('[ImageStorage.ts] Saving to camera roll:', destPath);
    const response = await CameraRoll.saveAsset(destPath, {
      type: 'photo',
      album: 'Tricordarr',
    });

    // Clean up the temporary file
    await RNFS.unlink(destPath);

    console.log('[ImageStorage.ts] Successfully saved to camera roll:', response);
    return response;
  } catch (error) {
    // Clean up the temporary file if it exists
    try {
      const exists = await RNFS.exists(destPath);
      if (exists) {
        await RNFS.unlink(destPath);
      }
    } catch (cleanupError) {
      console.warn('[ImageStorage.ts] Failed to clean up temporary file:', cleanupError);
    }

    console.error('[ImageStorage.ts] Failed to save image:', error);
    throw error;
  }
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

// https://github.com/georstat/react-native-image-cache/issues/81
export const getDirSize = async (dir: string, rootDir: string = dir) => {
  const files = await FileSystem.statDir(dir);

  const paths = files.map(async (file): Promise<number> => {
    const filePath = `${rootDir}${file.path}`;

    if (file.type === 'directory') {
      return getDirSize(filePath, rootDir);
    }

    return file.size;
  });

  return (await Promise.all(paths)).flat(Infinity).reduce((i, size) => i + size, 0);
};
