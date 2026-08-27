import React, {useCallback, useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';

import {APIImage} from '#src/Components/Images/APIImage';
import {AppImageViewer} from '#src/Components/Images/AppImageViewer';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {AppImageMetaData} from '#src/Types/AppImageMetaData';

interface ContentPostImagesProps {
  images: string[];
  messageOnRight?: boolean;
}

/**
 * Stacked API images for a forum or Fez post. Tapping any image opens a shared
 * AppImageViewer populated with every image on the post so the user can swipe
 * between them.
 */
export const ContentPostImages = ({images, messageOnRight}: ContentPostImagesProps) => {
  const {commonStyles} = useStyles();
  const {appConfig} = useConfig();
  const {serverUrl} = useSwiftarrQueryClient();
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const viewerImages = useMemo(
    () => images.map(fileName => AppImageMetaData.fromFileName(fileName, appConfig, serverUrl)),
    [images, appConfig, serverUrl],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        view: {
          ...commonStyles.fullWidth,
          ...(messageOnRight ? commonStyles.flexEnd : commonStyles.flexStart),
          ...commonStyles.roundedBorderLarge,
          ...commonStyles.overflowHidden,
        },
        image: {
          ...commonStyles.fullWidth,
        },
      }),
    [commonStyles, messageOnRight],
  );

  /**
   * Opens the shared viewer at the tapped image so the gallery starts on that photo.
   */
  const handleImagePress = useCallback((index: number) => {
    setViewerIndex(index);
    setIsViewerVisible(true);
  }, []);

  if (images.length === 0) {
    return null;
  }

  return (
    <>
      <AppImageViewer
        viewerImages={viewerImages}
        isVisible={isViewerVisible}
        setIsVisible={setIsViewerVisible}
        initialIndex={viewerIndex}
      />
      {images.map((image, index) => (
        <View key={image} style={styles.view}>
          <APIImage path={image} style={styles.image} mode={'scaledimage'} onPress={() => handleImagePress(index)} />
        </View>
      ))}
    </>
  );
};
