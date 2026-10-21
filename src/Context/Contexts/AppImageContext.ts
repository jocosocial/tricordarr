import {createContext, useContext} from 'react';
import {type ImageRequireSource, type View} from 'react-native';
import {type AnimatedRef} from 'react-native-reanimated';

import {type ImageSource, type LightboxImage} from '#src/Components/Lightbox/types';
import {AppConfig} from '#src/Libraries/AppConfig';
import {AppImageMetaData} from '#src/Types/AppImageMetaData';

export interface ToLightboxImageOptions {
  thumbRef?: AnimatedRef<View> | null;
  thumbBorderRadius?: number;
  type?: ImageSource['type'];
}

export interface AppImageContextType {
  fromFileName: (fileName: string, appConfig: AppConfig, serverUrl?: string) => AppImageMetaData;
  fromPublicPath: (path: string, appConfig: AppConfig, serverUrl?: string) => AppImageMetaData;
  fromIdenticon: (userID: string, appConfig: AppConfig, serverUrl?: string) => AppImageMetaData;
  fromData: (base64Data: string, mimeType?: string) => AppImageMetaData;
  fromAsset: (imageAsset: ImageRequireSource, fileName: string) => AppImageMetaData;
  getSourceURI: (imageMetaData: AppImageMetaData) => string;
  toLightboxImage: (metadata: AppImageMetaData, extras?: ToLightboxImageOptions) => LightboxImage;
}

export const AppImageContext = createContext(<AppImageContextType>{});

/**
 * Factory and derivation functions for `AppImageMetaData`, and its mapping onto the
 * Lightbox `LightboxImage` shape. Provided as a context (rather than a plain hook)
 * so consumers get stable function references across renders - AppImageProvider
 * defines these functions once, outside of component scope. A plain hook would
 * recreate them on every render, which was previously tripping effects that list
 * them as dependencies (e.g. APIImage) into infinite update loops.
 */
export const useAppImage = () => useContext(AppImageContext);
