import FastImage, {
  type Source as FastImageSource,
  type ImageStyle as FastImageStyle,
  type OnErrorEvent,
  type OnLoadEvent,
  type OnProgressEvent,
} from '@d11/react-native-fast-image';
import React, {useCallback, useEffect, useState} from 'react';
import {StyleProp, StyleSheet, View} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';

const IMAGE_PLACEHOLDER_HEIGHT = 200;

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
 * Displays an image using FastImage which seems to work for dynamically sized images.
 * I found that this lets me display an image at 100% width and a height that is proportional
 * to the original image. Uses FastImage.getSize to retrieve the image dimensions from the
 * FastImage cache rather than Image.getSize (which would use a different HTTP client and
 * cause duplicate requests).
 *
 * getSize is cache-only: on cache hit, dimensions arrive immediately without any network
 * request. On cache miss, we render a hidden FastImage to trigger the actual download and
 * obtain dimensions from its onLoad event (avoiding a duplicate fetch).
 *
 * While dimensions are loading, renders a placeholder View with a reserved minimum height
 * to bound layout shift. This prevents scroll jumps when images load in a list.
 */
export const AppScaledImage = ({image, style, onLoad, onError, onProgress}: AppScaledImageProps) => {
  const [imageSize, setImageSize] = useState<ImageDimensionProps>({width: undefined, height: undefined});
  const [cacheMiss, setCacheMiss] = useState(false);
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();

  useEffect(() => {
    if (image.uri) {
      setCacheMiss(false);
      FastImage.getSize(
        image.uri,
        (width, height) => {
          setImageSize({width, height});
        },
        () => {
          setCacheMiss(true);
        },
      );
    }
  }, [image.uri]);

  const handleFallbackLoad = useCallback(
    (event: OnLoadEvent) => {
      setImageSize({width: event.nativeEvent.width, height: event.nativeEvent.height});
      onLoad?.();
    },
    [onLoad],
  );

  // 0 / 0 by default is NaN which produces very funky not helpful errors.
  if (!imageSize.width || !imageSize.height || !image.uri) {
    const placeholderStyles = StyleSheet.create({
      placeholder: {
        height: IMAGE_PLACEHOLDER_HEIGHT,
        width: '100%',
        backgroundColor: theme.colors.surfaceVariant,
        borderRadius: 8,
        ...commonStyles.justifyCenter,
        ...commonStyles.alignItemsCenter,
        ...commonStyles.marginVerticalSmall,
      },
    });

    return (
      <View style={placeholderStyles.placeholder}>
        <ActivityIndicator />
        {cacheMiss && image.uri && (
          <FastImage
            style={placeholderHiddenImageStyle.hidden}
            source={{uri: image.uri}}
            onLoad={handleFallbackLoad}
            onError={onError}
          />
        )}
      </View>
    );
  }

  // https://stackoverflow.com/questions/36436913/image-contain-resizemode-not-working-in-react-native
  const styles = StyleSheet.create({
    image: {
      flex: 1,
      height: undefined,
      width: undefined,
      aspectRatio: imageSize.width / imageSize.height,
    },
  });

  return (
    <FastImage
      style={[styles.image, style]}
      source={{uri: image.uri}}
      onLoad={onLoad}
      onError={onError}
      onProgress={onProgress}
    />
  );
};

const placeholderHiddenImageStyle = StyleSheet.create({
  hidden: {
    width: 0,
    height: 0,
    position: 'absolute',
  },
});
