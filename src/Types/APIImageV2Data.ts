import {Image, ImageRequireSource} from 'react-native';
import {lookup as lookupMimeType} from 'react-native-mime-types';

import {AppConfig} from '#src/Libraries/AppConfig';

export interface APIImageV2Data {
  fileName: string;
  thumbURI?: string;
  fullURI?: string;
  mimeType: string;
  dataURI?: string; // Base64 encoded image data
}
export namespace APIImageV2Data {
  export const fromFileName = (fileName: string, appConfig: AppConfig): APIImageV2Data => {
    return {
      fileName: fileName,
      thumbURI: `${appConfig.serverUrl}${appConfig.urlPrefix}/image/${APIImageSizePaths.thumb}/${fileName}`,
      fullURI: `${appConfig.serverUrl}${appConfig.urlPrefix}/image/${APIImageSizePaths.full}/${fileName}`,
      mimeType: lookupMimeType(fileName) || 'application/octet-stream',
    };
  };

  /**
   * @deprecated nope
   * @param uri
   * @returns
   */
  export const fromURI = (uri: string): APIImageV2Data => {
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
  export const fromData = (base64Data: string, mimeType: string = 'image/jpeg'): APIImageV2Data => {
    const fileName = `tricordarr-${new Date().getTime()}.${mimeType.split('/')[1] || 'jpg'}`;
    return {
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
   * @param imageAsset The imported image asset
   * @param fileName The filename with extension (used to determine MIME type)
   */
  export const fromAsset = (imageAsset: ImageRequireSource, fileName: string): APIImageV2Data => {
    const resolvedAsset = Image.resolveAssetSource(imageAsset);
    const uri = resolvedAsset.uri;

    // Determine mimeType based on file extension
    const mimeType = lookupMimeType(fileName) || 'application/octet-stream';

    return {
      fileName: fileName,
      mimeType: mimeType,
      dataURI: uri, // Use the URI directly instead of base64 data
    };
  };
}

/**
 * Mapping of supported image sizes to URL paths.
 */
export const APIImageSizePaths = {
  thumb: 'thumb',
  full: 'full',
} as const;
