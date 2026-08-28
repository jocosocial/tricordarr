import React, {useCallback} from 'react';
import {ImageStyle, View, ViewStyle} from 'react-native';
import {useAnimatedRef} from 'react-native-reanimated';

import {APIImage} from '#src/Components/Images/APIImage';
import {useLightboxControls} from '#src/Components/Lightbox/state';
import {toLightboxImage} from '#src/Components/Lightbox/toLightboxImage';
import {AppImageMetaData} from '#src/Types/AppImageMetaData';

interface ContentPostImageThumbProps {
  fileName: string;
  index: number;
  images: AppImageMetaData[];
  style: {view: ViewStyle; image: ImageStyle};
}

/**
 * One thumbnail in a post image stack. Owns the animated ref so the lightbox
 * can zoom open from the tapped image.
 */
export const ContentPostImageThumb = ({fileName, index, images, style}: ContentPostImageThumbProps) => {
  const {openLightbox} = useLightboxControls();
  const thumbRef = useAnimatedRef<View>();

  /**
   * Opens the shared lightbox at this image so the gallery starts on the photo that was tapped.
   */
  const handlePress = useCallback(() => {
    openLightbox({
      images: images.map((metadata, i) => toLightboxImage(metadata, i === index ? {thumbRef} : {})),
      index,
    });
  }, [images, index, openLightbox, thumbRef]);

  return (
    <View ref={thumbRef} collapsable={false} style={style.view}>
      <APIImage path={fileName} style={style.image} mode={'scaledimage'} onPress={handlePress} />
    </View>
  );
};
