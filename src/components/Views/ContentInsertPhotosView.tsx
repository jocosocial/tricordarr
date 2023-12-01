import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {useStyles} from '../Context/Contexts/StyleContext';
import {useFormikContext} from 'formik';
import {PostContentData} from '../../libraries/Structs/ControllerStructs';
import {AppIcon} from '../Icons/AppIcon';
import {AppIcons} from '../../libraries/Enums/Icons';

export const ContentInsertPhotosView = () => {
  const {commonStyles} = useStyles();
  const {values, setFieldValue, isSubmitting} = useFormikContext<PostContentData>();

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
  });

  if (values.images.length === 0) {
    return null;
  }

  return (
    <View style={styles.imageRow}>
      {values.images.map((imageData, index) => {
        return (
          <View style={{position: 'relative'}}>
            <TouchableOpacity
              style={styles.imagePressable}
              key={index}
              onPress={() =>
                setFieldValue(
                  'images',
                  values.images.filter((img, idx) => idx !== index),
                )
              }
              disabled={isSubmitting}>
              <Image resizeMode={'cover'} style={styles.image} source={{uri: `data:image;base64,${imageData.image}`}} />
              <View style={styles.iconContainer}>
                <AppIcon icon={AppIcons.close} />
              </View>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
};
