import React, {useCallback, useMemo} from 'react';
import {StyleSheet, View, ViewStyle} from 'react-native';
import {Text} from 'react-native-paper';
import {useAnimatedRef} from 'react-native-reanimated';

import {APIImage} from '#src/Components/Images/APIImage';
import {useLightboxControls} from '#src/Components/Lightbox/state';
import {useAppImage} from '#src/Context/Contexts/AppImageContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {type ImageSize} from '#src/Libraries/ImageLayout';
import {AppImageMetaData} from '#src/Types/AppImageMetaData';

interface ContentPostImageThumbProps {
  index: number;
  images: AppImageMetaData[];
  /** Must give the thumbnail a size; the image fills it without affecting it. */
  style: ViewStyle;
  onImageSize: (fileName: string, size: ImageSize) => void;
  /** Overlay which of the post's images this is. */
  showPosition?: boolean;
}

/**
 * One thumbnail on a post. Owns the animated ref so the lightbox can zoom open from the tapped
 * image.
 */
export const ContentPostImageThumb = ({
  index,
  images,
  style,
  onImageSize,
  showPosition,
}: ContentPostImageThumbProps) => {
  const {fileName} = images[index];
  const {openLightbox} = useLightboxControls();
  const thumbRef = useAnimatedRef<View>();
  const {toLightboxImage} = useAppImage();
  const {commonStyles, styleDefaults} = useStyles();
  const {theme} = useAppTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        position: {
          ...commonStyles.roundedBorderCard,
          position: 'absolute',
          top: styleDefaults.marginSize / 4,
          right: styleDefaults.marginSize / 4,
          paddingHorizontal: styleDefaults.marginSize / 4,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
        },
        positionText: {
          color: theme.colors.constantWhite,
        },
      }),
    [commonStyles, styleDefaults, theme],
  );

  /**
   * Opens the shared lightbox at this image so the gallery starts on the photo that was tapped.
   */
  const handlePress = useCallback(() => {
    openLightbox({
      images: images.map((metadata, i) => toLightboxImage(metadata, i === index ? {thumbRef} : {})),
      index,
    });
  }, [images, index, openLightbox, thumbRef, toLightboxImage]);

  /** Reports the loaded image's size along with which image it is. */
  const handleImageSize = useCallback((size: ImageSize) => onImageSize(fileName, size), [onImageSize, fileName]);

  return (
    <View ref={thumbRef} collapsable={false} style={style}>
      <APIImage path={fileName} mode={'framedimage'} onImageSize={handleImageSize} onPress={handlePress} />
      {showPosition && (
        <View style={styles.position} pointerEvents={'none'}>
          <Text variant={'labelSmall'} style={styles.positionText}>{`${index + 1}/${images.length}`}</Text>
        </View>
      )}
    </View>
  );
};
