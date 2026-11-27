import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';

import {ContentPostImageRow} from '#src/Components/Images/ContentPostImageRow';
import {useAppImage} from '#src/Context/Contexts/AppImageContext';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {GALLERY_HEIGHT} from '#src/Libraries/ImageLayout';

interface ContentPostImagesProps {
  images: string[];
  messageOnRight?: boolean;
}

/**
 * API images for a forum or Fez post, as one sideways-scrolling gallery or stacked depending on
 * the user's preference.
 * Tapping any image opens a shared Lightbox populated with every image on the post so the user can
 * swipe between them.
 *
 * The height depends only on the width and the number of images, never on the images themselves.
 * Chat lists rely on this to hold their scroll position while images load.
 */
export const ContentPostImages = ({images, messageOnRight}: ContentPostImagesProps) => {
  const {commonStyles, styleDefaults} = useStyles();
  const {appConfig} = useConfig();
  const {serverUrl} = useSwiftarrQueryClient();
  const {fromFileName} = useAppImage();
  const galleryView = appConfig.userPreferences.imageGalleryView;
  const gap = styleDefaults.marginSize / 4;

  const viewerImages = useMemo(
    () => images.map(fileName => fromFileName(fileName, appConfig, serverUrl)),
    [images, appConfig, serverUrl, fromFileName],
  );

  const rows = useMemo(() => {
    const indexes = images.map((_, index) => index);
    return galleryView ? [indexes] : indexes.map(index => [index]);
  }, [galleryView, images]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          ...commonStyles.fullWidth,
          gap,
          marginTop: gap,
        },
      }),
    [commonStyles, gap],
  );

  if (images.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {rows.map(indexes => (
        <ContentPostImageRow
          key={images[indexes[0]]}
          images={viewerImages}
          indexes={indexes}
          gap={gap}
          alignEnd={messageOnRight}
          height={galleryView ? GALLERY_HEIGHT : undefined}
        />
      ))}
    </View>
  );
};
