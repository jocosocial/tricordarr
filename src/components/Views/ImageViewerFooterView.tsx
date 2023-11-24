import {useStyles} from '../Context/Contexts/StyleContext';
import {View} from 'react-native';
import React, {Dispatch, SetStateAction} from 'react';
import {ImageQueryData} from '../../libraries/Types';
import {IconButton} from 'react-native-paper';
import {AppIcons} from '../../libraries/Enums/Icons';

interface ImageViewerFooterViewProps {
  currentIndex: number;
  viewerImages: ImageQueryData[];
  setImageIndex: Dispatch<SetStateAction<number>>;
}

/**
 * The left/right buttons cause a flicker. Doesnt seem like a way to prevent this without access to the
 * VirtualizedList ref. The module also looks abandoned so this may need to change some day.
 */
export const ImageViewerFooterView = ({currentIndex, setImageIndex, viewerImages}: ImageViewerFooterViewProps) => {
  const {commonStyles} = useStyles();
  const styles = {
    buttonContainer: {
      ...commonStyles.flexRow,
      ...commonStyles.justifySpaceBetween,
      ...commonStyles.paddingHorizontal,
      ...commonStyles.paddingVertical,
      ...commonStyles.alignItemsCenter,
    },
    leftButtonContainer: {
      ...commonStyles.flex0,
    },
    leftButton: {
      ...commonStyles.flexStart,
    },
    rightButtonContainer: {
      ...commonStyles.flex0,
    },
    rightButton: {
      ...commonStyles.flexEnd,
    },
  };
  return (
    <View style={styles.buttonContainer}>
      <View style={styles.leftButtonContainer}>
        <IconButton
          onPress={() => setImageIndex(currentIndex - 1)}
          style={styles.leftButton}
          disabled={currentIndex === 0}
          icon={AppIcons.back}
        />
      </View>
      <View style={styles.rightButtonContainer}>
        <IconButton
          onPress={() => setImageIndex(currentIndex + 1)}
          style={styles.leftButton}
          disabled={currentIndex === viewerImages.length - 1}
          icon={AppIcons.forward}
        />
      </View>
    </View>
  );
};
