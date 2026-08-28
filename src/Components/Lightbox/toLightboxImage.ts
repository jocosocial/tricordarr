import {type View} from 'react-native';
import {type AnimatedRef} from 'react-native-reanimated';

import {type ImageSource, type LightboxImage} from '#src/Components/Lightbox/types';
import {AppImageMetaData} from '#src/Types/AppImageMetaData';

interface ToLightboxImageOptions {
  thumbRef?: AnimatedRef<View> | null;
  thumbBorderRadius?: number;
  type?: ImageSource['type'];
}

/**
 * Maps app image metadata onto the Lightbox ImageSource shape.
 *
 * Bundled assets keep the original `require()` number in `source` so FastImage
 * can render them on Android Release, where resolveAssetSource() is a
 * scheme-less drawable name.
 */
export const toLightboxImage = (metadata: AppImageMetaData, extras: ToLightboxImageOptions = {}): LightboxImage => {
  const uri = AppImageMetaData.getSourceURI(metadata);
  const dimensions =
    metadata.assetWidth && metadata.assetHeight ? {width: metadata.assetWidth, height: metadata.assetHeight} : null;
  return {
    uri,
    source: metadata.assetSource ?? {uri},
    dimensions,
    thumbUri: metadata.thumbURI ?? uri,
    thumbDimensions: dimensions,
    thumbRect: null,
    thumbRef: extras.thumbRef,
    thumbBorderRadius: extras.thumbBorderRadius,
    type: extras.type ?? 'image',
    metadata,
  };
};
