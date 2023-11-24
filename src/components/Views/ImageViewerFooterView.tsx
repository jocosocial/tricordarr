import {useStyles} from '../Context/Contexts/StyleContext';
import {View} from 'react-native';
import React, {Dispatch, SetStateAction} from 'react';
import {ImageQueryData} from '../../libraries/Types';
import {Text} from 'react-native-paper';

interface ImageViewerFooterViewProps {
  currentIndex: number;
  viewerImages: ImageQueryData[];
  setImageIndex: Dispatch<SetStateAction<number>>;
}

/**
 * The left/right buttons cause a flicker. Doesnt seem like a way to prevent this without access to the
 * VirtualizedList ref. The module also looks abandoned so this may need to change some day.
 * So I totally abandoned that thought and just displayed metadata instead.
 */
export const ImageViewerFooterView = ({currentIndex, setImageIndex, viewerImages}: ImageViewerFooterViewProps) => {
  const {commonStyles} = useStyles();
  const styles = {
    footerContainer: {
      ...commonStyles.flexRow,
      ...commonStyles.justifySpaceBetween,
      ...commonStyles.paddingHorizontal,
      ...commonStyles.paddingVertical,
      ...commonStyles.alignItemsCenter,
      ...commonStyles.justifyCenter,
    },
    verticalContainer: {
      ...commonStyles.flexColumn,
      ...commonStyles.alignItemsCenter,
    },
  };
  return (
    <View style={styles.footerContainer}>
      <View style={styles.verticalContainer}>
        <Text style={commonStyles.marginBottomSmall}>{viewerImages[currentIndex].fileName}</Text>
        <Text>
          {currentIndex + 1} of {viewerImages.length}
        </Text>
      </View>
    </View>
  );
};
