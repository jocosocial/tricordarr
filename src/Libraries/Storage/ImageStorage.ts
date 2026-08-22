import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {Asset} from 'expo-asset';
import {EncodingType, File, Paths} from 'expo-file-system';
import {Image} from 'react-native';
import * as mime from 'react-native-mime-types';

import {createLogger} from '#src/Libraries/Logger';
import {ImageQueryData} from '#src/Types';
import {AppImageMetaData} from '#src/Types/AppImageMetaData';

const logger = createLogger('ImageStorage.ts');

const extensionRegExp = new RegExp('\\.', 'i');

const getImageDestinationFile = (fileName: string, mimeType: string) => {
  let destName = fileName;
  if (!extensionRegExp.test(fileName)) {
    destName = `${fileName}.${mime.extension(mimeType)}`;
  }
  return new File(Paths.document, destName);
};

const writeBase64File = (file: File, base64Data: string) => {
  if (!file.exists) {
    file.create({intermediates: true, overwrite: true});
  }
  file.write(base64Data, {encoding: EncodingType.Base64});
};

const deleteIfExists = (file: File) => {
  if (file.exists) {
    file.delete();
  }
};

export const saveImageToCameraRoll = async (localURI: string) => {
  logger.debug('Saving image to camera roll from', localURI);
  const response = await CameraRoll.saveAsset(localURI, {
    type: 'photo',
    album: 'Tricordarr',
  });
  return response;
};

/**
 * Unpack a bundled asset into a real file:// URI CameraRoll can save.
 *
 * Do not use Asset.fromModule() here. On Android Release that API treats
 * scheme-less drawable resource names as already downloaded so RN Image
 * keeps working, but those names are not files. Constructing Asset with
 * an explicit type and calling downloadAsync() copies raw/drawable (and
 * file:///android_res/) into the cache via native ExpoAsset.
 */
export const saveAssetImageToLocal = async (image: AppImageMetaData) => {
  if (!image.assetSource) {
    throw new Error('Asset source is required to save an asset image');
  }
  const resolved = Image.resolveAssetSource(image.assetSource);
  if (!resolved?.uri) {
    throw new Error(`Could not resolve asset URI for ${image.fileName}`);
  }
  const type = mime.extension(image.mimeType) || 'jpg';
  const asset = new Asset({
    name: image.fileName.replace(/\.[^.]+$/, ''),
    type,
    uri: resolved.uri,
  });
  logger.debug('Materializing bundled asset', image.fileName, 'from', resolved.uri);
  await asset.downloadAsync();
  if (!asset.localUri || !asset.localUri.includes(':')) {
    throw new Error(`Failed to materialize asset ${image.fileName}`);
  }
  await saveImageURIToLocal(image.fileName, asset.localUri);
};

export const saveImageURIToLocal = async (fileName: string, imageURI: string) => {
  logger.debug(`Saving image to ${fileName} from ${imageURI}`);
  const cacheFile = new File(Paths.cache, fileName);
  if (imageURI.startsWith('http')) {
    logger.debug('Downloading file from', imageURI, 'to', cacheFile.uri);
    await File.downloadFileAsync(imageURI, cacheFile, {idempotent: true});
  } else {
    logger.debug('Copying file from', imageURI, 'to', cacheFile.uri);
    await new File(imageURI).copy(cacheFile, {overwrite: true});
  }
  await saveImageToCameraRoll(cacheFile.uri);
  deleteIfExists(cacheFile);
  logger.debug('Saved to camera roll');
};

/**
 * @deprecated this is brand new but deprecated because these functions are insane
 */
export const saveImageDataURIToCameraRoll = async (imageData: AppImageMetaData) => {
  const destFile = getImageDestinationFile(imageData.fileName, imageData.mimeType);
  const dataURI = imageData.dataURI;
  if (!dataURI) {
    throw Error(`No data to save to file ${destFile.uri}`);
  }
  logger.debug('Writing data to', destFile.uri, imageData.mimeType);
  writeBase64File(destFile, dataURI);
  const cameraRollSaveResult = await CameraRoll.save(destFile.uri, {
    type: 'photo',
    album: 'Tricordarr',
  });
  deleteIfExists(destFile);
  logger.debug('Saved to camera roll at', cameraRollSaveResult);
  return cameraRollSaveResult;
};

/**
 * @deprecated use saveImageURIToLocal instead
 */
export const saveImageQueryToLocal = async (imageData: ImageQueryData) => {
  const destFile = getImageDestinationFile(imageData.fileName, imageData.mimeType);
  if (!imageData.base64) {
    throw Error(`No data to save to file ${destFile.uri}`);
  }
  logger.debug('Writing data to', destFile.uri, imageData.mimeType);
  writeBase64File(destFile, imageData.base64);
  const cameraRollSaveResult = await CameraRoll.save(destFile.uri, {
    type: 'photo',
    album: 'Tricordarr',
  });
  deleteIfExists(destFile);
  logger.debug('Saved to camera roll at', cameraRollSaveResult);
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
  const destFile = getImageDestinationFile(image.fileName, image.mimeType);

  if (!image.dataURI) {
    throw new Error(`No dataURI provided for image ${image.fileName}`);
  }

  const dataURI = image.dataURI;

  try {
    // Handle different types of dataURI
    if (dataURI.startsWith('file://')) {
      // Copy file from local file system to destination
      logger.debug('Copying file from', dataURI, 'to', destFile.uri);
      await new File(dataURI).copy(destFile, {overwrite: true});
    } else if (dataURI.startsWith('http://') || dataURI.startsWith('https://')) {
      // Download file from URL to destination
      logger.debug('Downloading file from', dataURI, 'to', destFile.uri);
      await File.downloadFileAsync(dataURI, destFile, {idempotent: true});
    } else if (dataURI.startsWith('asset://') || dataURI.includes('asset_')) {
      // Handle bundled assets - these are typically referenced by name like 'asset_mainview_day'
      // The fromAsset function in APIImageV2Data resolves these to actual file paths
      // so we can treat them like regular file:// URIs
      logger.debug('Handling bundled asset:', dataURI);
      await new File(dataURI).copy(destFile, {overwrite: true});
    } else if (dataURI.startsWith('data:')) {
      // Handle base64 data URI
      logger.debug('Writing base64 data to', destFile.uri);
      const base64Data = dataURI.split(',')[1]; // Remove the data:image/jpeg;base64, prefix
      writeBase64File(destFile, base64Data);
    } else {
      throw new Error(`Unsupported dataURI format: ${dataURI.substring(0, 50)}...`);
    }

    // Always save to camera roll and return the response
    logger.debug('Saving to camera roll:', destFile.uri);
    const response = await CameraRoll.saveAsset(destFile.uri, {
      type: 'photo',
      album: 'Tricordarr',
    });

    // Clean up the temporary file
    deleteIfExists(destFile);

    logger.debug('Successfully saved to camera roll:', response);
    return response;
  } catch (error) {
    try {
      deleteIfExists(destFile);
    } catch (cleanupError) {
      logger.warn('Failed to clean up temporary file:', cleanupError);
    }

    logger.error('Failed to save image:', error);
    throw error;
  }
};
