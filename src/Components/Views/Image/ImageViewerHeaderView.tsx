import React, {useCallback} from 'react';
import {ImageRequireSource, ImageURISource, Platform, StyleSheet, View} from 'react-native';
import {IconButton, Text} from 'react-native-paper';

import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {useAppTheme} from '#src/Styles/Theme';
import {AppImageMetaData} from '#src/Types/AppImageMetaData';

interface ImageViewerHeaderViewProps {
  enableDownload: boolean;
  onSave: () => void;
  onClose: () => void;
  viewerImages: AppImageMetaData[];
  imageIndex: number;
  imageViewImages: (ImageURISource | ImageRequireSource)[];
}

export const ImageViewerHeaderView = ({
  viewerImages,
  imageIndex,
  enableDownload,
  onSave,
  onClose,
  imageViewImages,
}: ImageViewerHeaderViewProps) => {
  const {commonStyles} = useStyles();
  const theme = useAppTheme();
  const {appConfig} = useConfig();
  const [showMetadata, setShowMetadata] = React.useState(false);

  const styles = StyleSheet.create({
    buttonContainer: {
      ...commonStyles.flexRow,
      ...commonStyles.justifyContentEnd,
      ...commonStyles.imageViewerBackground,
      ...(Platform.OS === 'ios' && commonStyles.safePaddingTop),
    },
    textContainer: {
      ...commonStyles.imageViewerBackgroundAlpha,
    },
    infoText: {
      ...commonStyles.marginBottomSmall,
    },
  });

  const getDisplayURI = useCallback((image: AppImageMetaData) => {
    const imageURI = AppImageMetaData.getSourceURI(image);
    const displayLength = 100;
    if (imageURI.length > displayLength) {
      return `${imageURI.substring(0, displayLength)}...`;
    }
    return imageURI;
  }, []);

  const image = viewerImages[imageIndex];

  return (
    <View>
      <View style={styles.buttonContainer}>
        {appConfig.enableDeveloperOptions && (
          <IconButton
            icon={AppIcons.info}
            onPress={() => setShowMetadata(!showMetadata)}
            iconColor={theme.colors.onImageViewer}
          />
        )}
        {enableDownload && (
          <IconButton icon={AppIcons.download} onPress={onSave} iconColor={theme.colors.onImageViewer} />
        )}
        <IconButton icon={AppIcons.close} onPress={onClose} iconColor={theme.colors.onImageViewer} />
      </View>
      {showMetadata && (
        <PaddedContentView padTop={true} style={styles.textContainer}>
          <Text selectable={true} style={styles.infoText} variant={'bodySmall'}>
            mimeType: {viewerImages[imageIndex].mimeType}
          </Text>
          <Text selectable={true} style={styles.infoText} variant={'bodySmall'}>
            mode: {image.mode}
          </Text>
          <Text selectable={true} style={styles.infoText} variant={'bodySmall'}>
            URI: {getDisplayURI(image)}
          </Text>
        </PaddedContentView>
      )}
    </View>
  );
};
