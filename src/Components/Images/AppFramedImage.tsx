import FastImage, {
  type Source as FastImageSource,
  type OnErrorEvent,
  type OnLoadEvent,
  type OnProgressEvent,
} from '@d11/react-native-fast-image';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';

import {AppIcon} from '#src/Components/Icons/AppIcon';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {type ImageSize} from '#src/Libraries/ImageLayout';

interface AppFramedImageProps {
  /** Undefined while the source is still being resolved; the frame shows its loading state. */
  image?: FastImageSource;
  onLoad?: () => void;
  onError?: (event: OnErrorEvent) => void;
  onProgress?: (event: OnProgressEvent) => void;
  /** Called with the image's own size once it has loaded. */
  onImageSize?: (size: ImageSize) => void;
}

/**
 * @internal Do not use directly. Use {@link APIImage} instead.
 *
 * Shows a whole image, uncropped, inside a frame sized entirely by the parent. Nothing the image
 * does (resolving, loading, failing) changes the frame's size by itself.
 */
export const AppFramedImage = ({image, onLoad, onError, onProgress, onImageSize}: AppFramedImageProps) => {
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const uri = image?.uri;

  // A new URI is a new image: drop the previous one's state.
  useEffect(() => {
    setStatus('loading');
  }, [uri]);

  const handleLoad = useCallback(
    (event: OnLoadEvent) => {
      setStatus('loaded');
      onImageSize?.({width: event.nativeEvent.width, height: event.nativeEvent.height});
      onLoad?.();
    },
    [onImageSize, onLoad],
  );

  const handleError = useCallback(
    (event: OnErrorEvent) => {
      setStatus('error');
      onError?.(event);
    },
    [onError],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        frame: {
          ...StyleSheet.absoluteFill,
          ...commonStyles.overflowHidden,
          ...commonStyles.roundedBorderCard,
          ...(status === 'loaded' ? undefined : {backgroundColor: theme.colors.surfaceVariant}),
        },
        image: {
          width: '100%',
          height: '100%',
        },
        overlay: {
          ...StyleSheet.absoluteFill,
          ...commonStyles.justifyCenter,
          ...commonStyles.alignItemsCenter,
        },
      }),
    [commonStyles, theme, status],
  );

  return (
    <View style={styles.frame}>
      {image && (
        <FastImage
          style={styles.image}
          source={image}
          resizeMode={FastImage.resizeMode.contain}
          onLoad={handleLoad}
          onError={handleError}
          onProgress={onProgress}
        />
      )}
      {status !== 'loaded' && (
        <View style={styles.overlay} pointerEvents={'none'}>
          {status === 'error' ? <AppIcon icon={AppIcons.error} /> : <ActivityIndicator />}
        </View>
      )}
    </View>
  );
};
