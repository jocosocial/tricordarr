import {useStyles} from '#src/Components/Context/Contexts/StyleContext';
import {View} from 'react-native';
import React, {Dispatch, SetStateAction} from 'react';
import {ImageQueryData} from '#src/Libraries/Types';
import {Text} from 'react-native-paper';
import {StyleSheet} from 'react-native';

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
export const ImageViewerFooterView = ({currentIndex, viewerImages}: ImageViewerFooterViewProps) => {
  const {commonStyles} = useStyles();
  const styles = StyleSheet.create({
    footerContainer: {
      ...commonStyles.flexRow,
      ...commonStyles.justifySpaceBetween,
      ...commonStyles.paddingHorizontal,
      ...commonStyles.paddingVertical,
      ...commonStyles.alignItemsCenter,
      ...commonStyles.justifyCenter,
      ...commonStyles.imageViewerBackground,
    },
    verticalContainer: {
      ...commonStyles.flexColumn,
      ...commonStyles.alignItemsCenter,
    },
    filenameText: {
      ...commonStyles.marginBottomSmall,
      ...commonStyles.onImageViewer,
    },
    indexText: {
      ...commonStyles.onImageViewer,
    },
  });
  // This is a hack to get around the ImageViewer not updating in time if the underlying images changes and you
  // have already scrolled around in the viewer.
  // https://github.com/jobtoday/react-native-image-viewing/issues/203
  const filename = viewerImages[currentIndex] ? viewerImages[currentIndex].fileName : '';
  return (
    <View style={styles.footerContainer}>
      <View style={styles.verticalContainer}>
        <Text style={styles.filenameText}>{filename}</Text>
        <Text style={styles.indexText}>
          {currentIndex + 1} of {viewerImages.length}
        </Text>
      </View>
    </View>
  );
};
