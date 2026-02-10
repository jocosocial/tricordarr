import FastImage, {
  type Source as FastImageSource,
  type ImageStyle as FastImageStyle,
  type OnErrorEvent,
  type OnLoadEvent,
  type OnProgressEvent,
} from '@d11/react-native-fast-image';
import React, {useCallback, useState} from 'react';
import {StyleProp, StyleSheet} from 'react-native';

interface ImageDimensionProps {
  width?: number;
  height?: number;
}

interface AppScaledImageProps {
  image: FastImageSource;
  style?: StyleProp<FastImageStyle>;
  onLoad?: () => void;
  onError?: (event: OnErrorEvent) => void;
  onProgress?: (event: OnProgressEvent) => void;
}

/**
 * Displays an image using FastImage with aspect ratio from the loaded image.
 * Dimensions are taken from FastImage's onLoad (one network request) instead of
 * Image.getSize (which would use a different HTTP client and cause duplicate requests).
 */
export const AppScaledImage = ({image, style, onLoad, onError, onProgress}: AppScaledImageProps) => {
  const [imageSize, setImageSize] = useState<ImageDimensionProps>({width: undefined, height: undefined});

  /**
   * This used to call Image.getSize() which secretly was fetching the image
   * again which is not cool in low network conditions. This issue was unique
   * to AppScaledImage due to the aspect ratio things.
   */
  const handleLoad = useCallback(
    (event: OnLoadEvent) => {
      const {width, height} = event.nativeEvent;
      setImageSize({width, height});
      onLoad?.();
    },
    [onLoad],
  );

  if (!image.uri) {
    return null;
  }

  const aspectRatio =
    imageSize.width != null && imageSize.height != null && imageSize.height > 0
      ? imageSize.width / imageSize.height
      : 1;

  const styles = StyleSheet.create({
    image: {
      flex: 1,
      height: undefined,
      width: undefined,
      aspectRatio,
    },
  });

  return (
    <FastImage
      style={[styles.image, style]}
      source={{uri: image.uri}}
      onLoad={handleLoad}
      onError={onError}
      onProgress={onProgress}
    />
  );
};
