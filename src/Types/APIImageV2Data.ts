import {lookup as lookupMimeType} from 'react-native-mime-types';

import {AppConfig} from '#src/Libraries/AppConfig';

export interface APIImageV2Data {
  fileName: string;
  thumbURI: string;
  fullURI: string;
  mimeType: string;
  rawData?: string; // Base64 encoded image data
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
      rawData: rawData,
    };
  };

  export const fromData = (base64Data: string, mimeType: string = 'image/jpeg'): APIImageV2Data => {
    const fileName = `tricordarr-${new Date().getTime()}.${mimeType.split('/')[1] || 'jpg'}`;
    const dataURI = `data:${mimeType};base64,${base64Data}`;
    return {
      fileName: fileName,
      thumbURI: dataURI,
      fullURI: dataURI,
      mimeType: mimeType,
      rawData: base64Data,
    };
  };

  export const toDataURI = (imageData: APIImageV2Data): string => {
    if (imageData.rawData) {
      return `data:${imageData.mimeType};base64,${imageData.rawData}`;
    }
    // Fallback to using the fullURI if rawData is not available
    return imageData.fullURI;
  };
}
export const APIImageSizePaths = {
  thumb: 'thumb',
  full: 'full',
} as const;
