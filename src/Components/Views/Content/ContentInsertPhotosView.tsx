import {useFormikContext} from 'formik';
import React, {useCallback, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';

import {ContentPostAttachedImage} from '#src/Components/Images/ContentPostAttachedImage';
import {useLightboxControls} from '#src/Components/Lightbox/state';
import {toLightboxImage} from '#src/Components/Lightbox/toLightboxImage';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {PostContentData} from '#src/Structs/ControllerStructs';
import {AppImageMetaData} from '#src/Types/AppImageMetaData';

export const ContentInsertPhotosView = () => {
  const {commonStyles} = useStyles();
  const {values, setFieldValue, isSubmitting} = useFormikContext<PostContentData>();
  const [viewerImages, setViewerImages] = useState<AppImageMetaData[]>([]);
  const {openLightbox} = useLightboxControls();

  const styles = StyleSheet.create({
    imageRow: {
      ...commonStyles.flexRow,
      ...commonStyles.flexWrap,
      ...commonStyles.gapSmall,
      ...commonStyles.marginTopSmall,
    },
  });

  useEffect(() => {
    setViewerImages(
      values.images
        .filter(img => img.image)
        .map(img => {
          return AppImageMetaData.fromData(img.image!);
        }),
    );
  }, [values.images]);

  /**
   * Opens the composer-attachment gallery. Saving is disabled because these
   * images have not been uploaded yet.
   */
  const handleImagePress = useCallback(
    (index: number) => {
      openLightbox({
        images: viewerImages.map(metadata => toLightboxImage(metadata)),
        index,
        allowSave: false,
      });
    },
    [openLightbox, viewerImages],
  );

  if (values.images.length === 0) {
    return null;
  }

  return (
    <View style={styles.imageRow}>
      {values.images.map((imageData, index) => {
        return (
          <ContentPostAttachedImage
            key={index}
            onIconPress={() => {
              setFieldValue(
                'images',
                values.images.filter((img, idx) => idx !== index),
              );
            }}
            onImagePress={() => handleImagePress(index)}
            disabled={isSubmitting}
            imageData={imageData}
          />
        );
      })}
    </View>
  );
};
