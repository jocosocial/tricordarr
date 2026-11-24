import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';

import {ContentPostImageThumb} from '#src/Components/Images/ContentPostImageThumb';
import {useAppImage} from '#src/Context/Contexts/AppImageContext';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {getGalleryLayout, POST_IMAGE_ASPECT_RATIO} from '#src/Libraries/ImageLayout';

interface ContentPostImagesProps {
  images: string[];
  messageOnRight?: boolean;
}

/**
 * API images for a forum or Fez post, as a gallery or stacked depending on the user's preference.
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

  const viewerImages = useMemo(
    () => images.map(fileName => fromFileName(fileName, appConfig, serverUrl)),
    [images, appConfig, serverUrl, fromFileName],
  );

  const layout = useMemo(() => getGalleryLayout(images.length), [images.length]);

  const styles = useMemo(() => {
    const gap = styleDefaults.marginSize / 4;
    return StyleSheet.create({
      container: {
        ...commonStyles.fullWidth,
        gap,
        marginTop: gap,
      },
      stackedImage: {
        ...commonStyles.fullWidth,
        aspectRatio: POST_IMAGE_ASPECT_RATIO,
      },
      row: {
        ...commonStyles.fullWidth,
        ...commonStyles.flexRow,
        aspectRatio: layout.rowAspectRatio,
        gap,
      },
      tile: {
        ...commonStyles.flex,
      },
    });
  }, [commonStyles, styleDefaults, layout.rowAspectRatio]);

  if (images.length === 0) {
    return null;
  }

  if (!galleryView) {
    return (
      <View style={styles.container}>
        {images.map((image, index) => (
          <ContentPostImageThumb
            key={image}
            fileName={image}
            index={index}
            images={viewerImages}
            style={styles.stackedImage}
            align={messageOnRight ? 'end' : 'start'}
          />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {layout.rows.map(row => (
        <View key={row[0]} style={styles.row}>
          {row.map(index => (
            <ContentPostImageThumb
              key={images[index]}
              fileName={images[index]}
              index={index}
              images={viewerImages}
              style={styles.tile}
              align={'center'}
            />
          ))}
        </View>
      ))}
    </View>
  );
};
