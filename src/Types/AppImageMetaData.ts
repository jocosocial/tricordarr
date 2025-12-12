import {Image, ImageRequireSource} from 'react-native';
import {lookup as lookupMimeType} from 'react-native-mime-types';

import {AppConfig} from '#src/Libraries/AppConfig';

export enum AppImageMode {
  api = 'api',
  asset = 'asset',
  data = 'data',
  identicon = 'identicon',
}

export interface AppImageMetaData {
  mode: AppImageMode;
  fileName: string;
  mimeType: string;
  thumbURI?: string;
  fullURI?: string;
  dataURI?: string;
  identiconURI?: string;
  assetURI?: string;
}
export namespace AppImageMetaData {
  export const fromFileName = (fileName: string, appConfig: AppConfig): AppImageMetaData => {
    const serverUrl = appConfig.preRegistrationMode ? appConfig.preRegistrationServerUrl : appConfig.serverUrl;
    return {
      mode: AppImageMode.api,
      fileName: fileName,
      thumbURI: `${serverUrl}${appConfig.urlPrefix}/image/${APIImageSizePaths.thumb}/${fileName}`,
      fullURI: `${serverUrl}${appConfig.urlPrefix}/image/${APIImageSizePaths.full}/${fileName}`,
      mimeType: lookupMimeType(fileName) || 'application/octet-stream',
    };
  };

  export const fromIdenticon = (userID: string, appConfig: AppConfig): AppImageMetaData => {
    const serverUrl = appConfig.preRegistrationMode ? appConfig.preRegistrationServerUrl : appConfig.serverUrl;
    return {
      mode: AppImageMode.identicon,
      fileName: `${userID}.png`,
      identiconURI: `${serverUrl}${appConfig.urlPrefix}/image/${APIImageSizePaths.identicon}/${userID}`,
      mimeType: 'image/png', // This comes from Swiftarr ImageController.swift
    };
  };

  /**
   * @deprecated nope
   * @param uri
   * @returns
   */
  export const fromURI = (uri: string): AppImageMetaData => {
    // Remove query parameters before extracting filename
    const uriWithoutQuery = uri.split('?')[0];
    const fileName = uriWithoutQuery.split('/').pop() || 'unknown';

    // Check if this is a data URI and extract rawData and mimeType if so
    let rawData: string | undefined;
    let mimeType: string;

    if (uri.startsWith('data:')) {
      const base64Index = uri.indexOf('base64,');
      if (base64Index !== -1) {
        rawData = uri.substring(base64Index + 7);
        // Extract mimeType from data URI (e.g., "data:image/jpeg;base64," -> "image/jpeg")
        const mimeTypeMatch = uri.match(/^data:([^;]+);/);
        mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'application/octet-stream';
      } else {
        mimeType = 'application/octet-stream';
      }
    } else {
      mimeType = lookupMimeType(fileName) || 'application/octet-stream';
    }

    return {
      fileName: fileName,
      thumbURI: uri,
      fullURI: uri,
      mimeType: mimeType,
      dataURI: `data:${mimeType};base64,${rawData}`,
    };
  };

  /**
   * Create an object from a base64 data string. This is used when the user takes a photo
   * and we insert its base64 data into a form field. We do this so that the preview can
   * support the AppImageViewer component for inspection.
   */
  export const fromData = (base64Data: string, mimeType: string = 'image/jpeg'): AppImageMetaData => {
    const fileName = `tricordarr-${new Date().getTime()}.${mimeType.split('/')[1] || 'jpg'}`;
    return {
      mode: AppImageMode.data,
      fileName: fileName,
      mimeType: mimeType,
      dataURI: `data:${mimeType};base64,${base64Data}`,
    };
  };

  /**
   * Create an object from a directly imported image asset (ImageRequireSource).
   * This function converts a local asset import like `import DayImage from '#assets/mainview_day.jpg'`
   * into an APIImageV2Data object with proper URI, mimeType, and fileName.
   * Note: For bundled assets, we use the URI directly instead of base64 data since
   * bundled assets can't be easily read as files.
   *
   * @deprecated doesnt work
   * @param imageAsset The imported image asset
   * @param fileName The filename with extension (used to determine MIME type)
   */
  export const fromAsset = (imageAsset: ImageRequireSource, fileName: string): AppImageMetaData => {
    // Determine mimeType based on file extension
    const mimeType = lookupMimeType(fileName) || 'application/octet-stream';

    return {
      mode: AppImageMode.asset,
      fileName: fileName,
      mimeType: mimeType,
      assetURI: Image.resolveAssetSource(imageAsset).uri,
    };
  };

  export const getSourceURI = (imageMetaData: AppImageMetaData): string => {
    switch (imageMetaData.mode) {
      case AppImageMode.api:
        if (!imageMetaData.fullURI) {
          throw new Error('Full URI is required for API images');
        }
        return imageMetaData.fullURI;
      case AppImageMode.asset:
        if (!imageMetaData.assetURI) {
          throw new Error('Asset URI is required for asset images');
        }
        return imageMetaData.assetURI;
      case AppImageMode.data:
        if (!imageMetaData.dataURI) {
          throw new Error('Data URI is required for data images');
        }
        return imageMetaData.dataURI;
      case AppImageMode.identicon:
        if (!imageMetaData.identiconURI) {
          throw new Error('Identicon URI is required for identicon images');
        }
        return imageMetaData.identiconURI;
    }
  };
}

/**
 * Mapping of supported image sizes to URL paths.
 */
export const APIImageSizePaths = {
  thumb: 'thumb',
  full: 'full',
  identicon: 'user/identicon',
} as const;
