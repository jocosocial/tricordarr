import {createContext, useContext} from 'react';
import {ImageSourcePropType, ImageURISource} from 'react-native';

import {ImageQueryData} from '#src/Types';

export interface ImageContextType {
  fromData: (data: string) => ImageQueryData;
  toImageSource: (queryData: ImageQueryData) => ImageSourcePropType;
  toImageURISource: (queryData: ImageQueryData) => ImageURISource;
}

export const ImageContext = createContext(<ImageContextType>{});

/**
 * Pure helpers for base64 data-URI images (ImageQueryData) - a narrower shape than
 * AppImageMetaData/AppImageContext, used where the image is a raw base64 string rather
 * than an API-hosted file (e.g. a freshly taken photo before upload). Provided as a
 * context (rather than a plain hook) so consumers get stable function references across
 * renders - see AppImageContext.ts for the full rationale. Named ImageContext rather than
 * scoped to today's ImageQueryData shape so it can grow to hold other image helpers later.
 */
export const useImage = () => useContext(ImageContext);
