import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import {isIOS} from '#src/Libraries/Platform/Detection';
import {AppImageMetaData} from '#src/Types/AppImageMetaData';

interface ImageViewerFooterViewProps {
  currentIndex: number;
  viewerImages: AppImageMetaData[];
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
      ...commonStyles.imageViewerBackgroundAlpha,
      ...(isIOS && commonStyles.safePaddingBottom),
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
  //
  // The Text variant is because iOS was too big and defaultly newlined the g in jpg.
  const filename = viewerImages[currentIndex] ? viewerImages[currentIndex].fileName : '';

  return (
    <View style={styles.footerContainer}>
      <View style={styles.verticalContainer}>
        <Text selectable={true} style={styles.filenameText} variant={'bodyMedium'}>
          {filename}
        </Text>
        <Text style={styles.indexText} variant={'bodyMedium'}>
          {currentIndex + 1} of {viewerImages.length}
        </Text>
      </View>
    </View>
  );
};
