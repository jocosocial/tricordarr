import FastImage, {
  type Source as FastImageSource,
  type ImageStyle as FastImageStyle,
  type OnErrorEvent,
  type OnLoadEvent,
  type OnProgressEvent,
} from '@d11/react-native-fast-image';
import React, {useEffect, useState} from 'react';
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
 * Displays an image using FastImage at 100% width with a proportional height based on the
 * loaded image dimensions.
 *
 * While dimensions are loading, renders a placeholder View with a reserved minimum height
 * to bound layout shift. This prevents scroll jumps when images load in a list.
 */
export const AppScaledImage = ({image, style, onLoad, onError, onProgress}: AppScaledImageProps) => {
  const [imageSize, setImageSize] = useState<ImageDimensionProps>({width: undefined, height: undefined});
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();

  useEffect(() => {
    setImageSize({width: undefined, height: undefined});
  }, [image.uri]);

  const handleLoad = (event: OnLoadEvent) => {
    const {width, height} = event.nativeEvent;
    setImageSize({width, height});
    onLoad?.();
  };

  const hasImageSize = !!imageSize.width && !!imageSize.height && !!image.uri;
  const styles = StyleSheet.create({
    placeholder: {
      height: IMAGE_PLACEHOLDER_HEIGHT,
      width: '100%',
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 8,
      overflow: 'hidden',
      ...commonStyles.justifyCenter,
      ...commonStyles.alignItemsCenter,
      ...commonStyles.marginVerticalSmall,
    },
    loadingImage: {
      width: '100%',
      height: '100%',
      opacity: 0,
    },
    image: {
      width: '100%',
      aspectRatio: hasImageSize ? imageSize.width! / imageSize.height! : undefined,
    },
    loadingIndicator: {
      position: 'absolute',
    },
  });

  return (
    <View style={!hasImageSize ? styles.placeholder : undefined}>
      <FastImage
        style={[hasImageSize ? styles.image : styles.loadingImage, style]}
        source={{uri: image.uri}}
        onLoad={handleLoad}
        onError={onError}
        onProgress={onProgress}
      />
      {!hasImageSize && <ActivityIndicator style={styles.loadingIndicator} />}
    </View>
  );
};
