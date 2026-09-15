import React, {useMemo} from 'react';
import {StyleSheet} from 'react-native';

import {ContentPostImageThumb} from '#src/Components/Images/ContentPostImageThumb';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {AppImageMetaData} from '#src/Types/AppImageMetaData';

interface ContentPostImagesProps {
  images: string[];
  messageOnRight?: boolean;
}

/**
 * Stacked API images for a forum or Fez post. Tapping any image opens a shared
 * Lightbox populated with every image on the post so the user can swipe
 * between them.
 */
export const ContentPostImages = ({images, messageOnRight}: ContentPostImagesProps) => {
  const {commonStyles} = useStyles();
  const {appConfig} = useConfig();
  const {serverUrl} = useSwiftarrQueryClient();

  const viewerImages = useMemo(
    () => images.map(fileName => AppImageMetaData.fromFileName(fileName, appConfig, serverUrl)),
    [images, appConfig, serverUrl],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        view: {
          ...commonStyles.fullWidth,
          ...(messageOnRight ? commonStyles.flexEnd : commonStyles.flexStart),
          ...commonStyles.roundedBorderLarge,
          ...commonStyles.overflowHidden,
        },
        image: {
          ...commonStyles.fullWidth,
        },
      }),
    [commonStyles, messageOnRight],
  );

  if (images.length === 0) {
    return null;
  }

  return (
    <>
      {images.map((image, index) => (
        <ContentPostImageThumb key={image} fileName={image} index={index} images={viewerImages} style={styles} />
      ))}
    </>
  );
};
