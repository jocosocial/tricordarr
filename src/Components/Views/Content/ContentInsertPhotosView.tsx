import {useFormikContext} from 'formik';
import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';

import {AppImageViewer} from '#src/Components/Images/AppImageViewer';
import {ContentPostAttachedImage} from '#src/Components/Images/ContentPostAttachedImage';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {PostContentData} from '#src/Structs/ControllerStructs';
import {ImageQueryData} from '#src/Types';

// Some day it might be good to break the viewer out of this into a generic "PendingAttachmentImage" thing.
// Basically APIImage but LocalImage or BlobImage
export const ContentInsertPhotosView = () => {
  const {commonStyles} = useStyles();
  const {values, setFieldValue, isSubmitting} = useFormikContext<PostContentData>();
  const [viewerImages, setViewerImages] = useState<ImageQueryData[]>([]);
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const styles = StyleSheet.create({
    imageRow: {
      ...commonStyles.flexRow,
      ...commonStyles.marginTopSmall,
    },
  });

  useEffect(() => {
    setViewerImages(
      values.images.map(img => {
        return ImageQueryData.fromData(img.image);
      }),
    );
  }, [values.images]);

  if (values.images.length === 0) {
    return null;
  }

  return (
    <View style={styles.imageRow}>
      <AppImageViewer
        viewerImages={viewerImages}
        isVisible={isViewerVisible}
        setIsVisible={setIsViewerVisible}
        enableDownload={false}
        initialIndex={viewerIndex}
      />
      {values.images.map((imageData, index) => {
        return (
          <ContentPostAttachedImage
            key={index}
            onIconPress={() => {
              setFieldValue(
                'images',
                values.images.filter((img, idx) => idx !== index),
              );
              setViewerIndex(0);
            }}
            onImagePress={() => {
              setViewerIndex(index);
              setIsViewerVisible(true);
            }}
            disabled={isSubmitting}
            imageData={imageData}
          />
        );
      })}
    </View>
  );
};
