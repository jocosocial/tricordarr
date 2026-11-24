import React, {useCallback} from 'react';
import {View, ViewStyle} from 'react-native';
import {useAnimatedRef} from 'react-native-reanimated';

import {APIImage} from '#src/Components/Images/APIImage';
import {useLightboxControls} from '#src/Components/Lightbox/state';
import {useAppImage} from '#src/Context/Contexts/AppImageContext';
import {type ImageSize} from '#src/Libraries/ImageLayout';
import {AppImageMetaData} from '#src/Types/AppImageMetaData';

interface ContentPostImageThumbProps {
  index: number;
  images: AppImageMetaData[];
  /** Must give the thumbnail a size; the image fills it without affecting it. */
  style: ViewStyle;
  onImageSize: (fileName: string, size: ImageSize) => void;
}

/**
 * One thumbnail on a post. Owns the animated ref so the lightbox can zoom open from the tapped
 * image.
 */
export const ContentPostImageThumb = ({index, images, style, onImageSize}: ContentPostImageThumbProps) => {
  const {fileName} = images[index];
  const {openLightbox} = useLightboxControls();
  const thumbRef = useAnimatedRef<View>();
  const {toLightboxImage} = useAppImage();

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
    </View>
  );
};
