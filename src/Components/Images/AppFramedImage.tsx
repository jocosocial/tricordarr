import FastImage, {
  type Source as FastImageSource,
  type OnErrorEvent,
  type OnLoadEvent,
  type OnProgressEvent,
} from '@d11/react-native-fast-image';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {LayoutChangeEvent, StyleSheet, View} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';

import {AppIcon} from '#src/Components/Icons/AppIcon';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {getFittedImageSize, type ImageFrameAlign} from '#src/Libraries/ImageLayout';

interface AppFramedImageProps {
  /** Undefined while the source is still being resolved; the frame shows its loading state. */
  image?: FastImageSource;
  align?: ImageFrameAlign;
  onLoad?: () => void;
  onError?: (event: OnErrorEvent) => void;
  onProgress?: (event: OnProgressEvent) => void;
}

/**
 * @internal Do not use directly. Use {@link APIImage} instead.
 *
 * Shows a whole image, uncropped, inside a frame sized entirely by the parent. Nothing the image
 * does (resolving, loading, failing) changes the frame's size, so a list row's height is known
 * before any image data arrives. Aligning to a side leaves the rest of the frame transparent;
 * centering fills it with a background.
 */
export const AppFramedImage = ({image, align = 'center', onLoad, onError, onProgress}: AppFramedImageProps) => {
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [imageSize, setImageSize] = useState<{width: number; height: number}>();
  const [frameSize, setFrameSize] = useState<{width: number; height: number}>();
  const uri = image?.uri;

  // A new URI is a new image: drop the previous one's state.
  useEffect(() => {
    setStatus('loading');
    setImageSize(undefined);
  }, [uri]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const {width, height} = event.nativeEvent.layout;
    setFrameSize(previous =>
      previous && previous.width === width && previous.height === height ? previous : {width, height},
    );
  }, []);

  const handleLoad = useCallback(
    (event: OnLoadEvent) => {
      setImageSize({width: event.nativeEvent.width, height: event.nativeEvent.height});
      setStatus('loaded');
      onLoad?.();
    },
    [onLoad],
  );

  const handleError = useCallback(
    (event: OnErrorEvent) => {
      setStatus('error');
      onError?.(event);
    },
    [onError],
  );

  // Side alignment needs the picture's own box, which is only known once it has loaded. Until then
  // the image fills the frame, hidden under the loading state.
  const fittedSize = useMemo(
    () => (align !== 'center' && imageSize && frameSize ? getFittedImageSize(imageSize, frameSize) : undefined),
    [align, imageSize, frameSize],
  );
  const showBackground = align === 'center' || status !== 'loaded';

  const styles = useMemo(
    () =>
      StyleSheet.create({
        frame: {
          ...StyleSheet.absoluteFill,
          ...commonStyles.overflowHidden,
          ...commonStyles.roundedBorderCard,
          ...(align === 'end' ? commonStyles.alignItemsEnd : undefined),
          ...(showBackground ? {backgroundColor: theme.colors.surfaceVariant} : undefined),
        },
        image: {
          ...(fittedSize ?? {width: '100%', height: '100%'}),
          ...(align === 'center' ? undefined : commonStyles.roundedBorderCard),
          opacity: status === 'loaded' ? 1 : 0,
        },
        overlay: {
          ...StyleSheet.absoluteFill,
          ...commonStyles.justifyCenter,
          ...commonStyles.alignItemsCenter,
        },
      }),
    [commonStyles, theme, align, showBackground, fittedSize, status],
  );

  return (
    <View style={styles.frame} onLayout={handleLayout}>
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
