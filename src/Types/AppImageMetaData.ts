import {ImageRequireSource} from 'react-native';

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
  assetSource?: ImageRequireSource;
  assetWidth?: number;
  assetHeight?: number;
}

/**
 * Mapping of supported image sizes to URL paths.
 */
export const APIImageSizePaths = {
  thumb: 'thumb',
  full: 'full',
  identicon: 'user/identicon',
} as const;
