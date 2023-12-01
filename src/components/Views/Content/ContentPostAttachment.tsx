import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import {AppIcon} from '../../Icons/AppIcon';
import {AppIcons} from '../../../libraries/Enums/Icons';
import React, {PropsWithChildren} from 'react';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {ImageSource} from 'react-native-vector-icons/Icon';

interface ContentPostAttachmentImageProps extends PropsWithChildren {
  onIconPress: () => void;
  disabled?: boolean;
  onImagePress?: () => void;
}

export const ContentPostAttachment = ({
  onIconPress,
  disabled,
  onImagePress,
  children,
}: ContentPostAttachmentImageProps) => {
  const {commonStyles} = useStyles();
  const styles = StyleSheet.create({
    imagePressable: {
      ...commonStyles.roundedBorder,
      ...commonStyles.overflowHidden,
      ...commonStyles.marginRightSmall,
    },
    iconContainer: {
      position: 'absolute',
      top: 0,
      right: 0,
    },
    imageContainer: {
      position: 'relative',
    },
  });
  return (
    <View style={styles.imageContainer}>
      <TouchableOpacity style={styles.imagePressable} onPress={onImagePress} disabled={disabled}>
        {children}
        <TouchableOpacity style={styles.iconContainer} onPress={onIconPress} disabled={disabled}>
          <AppIcon icon={AppIcons.close} />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};
