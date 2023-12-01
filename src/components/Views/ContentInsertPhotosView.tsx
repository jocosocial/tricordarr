import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useStyles} from '../Context/Contexts/StyleContext';
import {useFormikContext} from 'formik';
import {PostContentData} from '../../libraries/Structs/ControllerStructs';
import {AppIcon} from '../Icons/AppIcon';
import {AppIcons} from '../../libraries/Enums/Icons';
import {AppImageViewer} from '../Images/AppImageViewer';
import {ImageQueryData} from '../../libraries/Types';

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
    imagePressable: {
      ...commonStyles.roundedBorder,
      ...commonStyles.overflowHidden,
      ...commonStyles.marginRightSmall,
    },
    image: {width: 64, height: 64},
    iconContainer: {
      position: 'absolute',
      top: 0, // Adjust top position as needed
      right: 0, // Adjust right position as needed
    },
    imageContainer: {position: 'relative'},
  });

  useEffect(() => {
    setViewerImages(
      values.images.map(img => {
        return {
          mimeType: 'image',
          dataURI: `data:image;base64,${img.image}`,
          fileName: 'New Image',
        };
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
          <View key={index} style={styles.imageContainer}>
            <TouchableOpacity
              style={styles.imagePressable}
              onPress={() => {
                setViewerIndex(index);
                setIsViewerVisible(true);
              }}
              disabled={isSubmitting}>
              <Image resizeMode={'cover'} style={styles.image} source={{uri: `data:image;base64,${imageData.image}`}} />
              <TouchableOpacity
                style={styles.iconContainer}
                onPress={() => {
                  setFieldValue(
                    'images',
                    values.images.filter((img, idx) => idx !== index),
                  );
                  setViewerIndex(0);
                }}>
                <AppIcon icon={AppIcons.close} />
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
};
