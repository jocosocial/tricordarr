import React, {useMemo} from 'react';
import {LayoutChangeEvent, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {ImageMetadataView} from '#src/Components/Views/Image/ImageMetadataView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppImageMetaData} from '#src/Types/AppImageMetaData';

interface FooterProps {
  fileName: string;
  image?: AppImageMetaData;
  onLayout?: (event: LayoutChangeEvent) => void;
}

/**
 * Lightbox footer. Always shows the filename. When Info is toggled, also shows
 * ImageMetadataView in the same animated slot Bluesky used for alt text.
 * Absolutely positioned so ImageMetadataView's `flex: 1` sizes to content
 * instead of collapsing inside the chrome column.
 */
export const Footer = ({fileName, image, onLayout}: FooterProps) => {
  const {commonStyles} = useStyles();
  const insets = useSafeAreaInsets();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'box-none',
          paddingBottom: insets.bottom + 8,
        },
        filenameWrap: {
          ...commonStyles.alignItemsCenter,
          ...commonStyles.paddingHorizontal,
          ...commonStyles.paddingVerticalSmall,
          ...commonStyles.imageViewerBackgroundAlpha,
        },
        filenameText: {
          ...commonStyles.onImageViewer,
        },
      }),
    [commonStyles, insets.bottom],
  );

  return (
    <View style={styles.root} onLayout={onLayout}>
      <View style={styles.filenameWrap}>
        <Text selectable={true} style={styles.filenameText} variant={'bodyMedium'}>
          {fileName}
        </Text>
      </View>
      {image && <ImageMetadataView image={image} />}
    </View>
  );
};
