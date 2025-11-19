import FastImage from '@d11/react-native-fast-image';
import React, {useCallback} from 'react';
import {Platform, StyleSheet, View} from 'react-native';
import {IconButton, Text} from 'react-native-paper';

import {HyperlinkText} from '#src/Components/Text/HyperlinkText';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {AppImageMetaData, AppImageMode} from '#src/Types/AppImageMetaData';

interface ImageViewerHeaderViewProps {
  enableDownload: boolean;
  onSave: () => void;
  onClose: () => void;
  viewerImages: AppImageMetaData[];
  imageIndex: number;
}

export const ImageViewerHeaderView = ({
  viewerImages,
  imageIndex,
  enableDownload,
  onSave,
  onClose,
}: ImageViewerHeaderViewProps) => {
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();
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
    const displayLength = 200;
    if (imageURI.length > displayLength) {
      return `${imageURI.substring(0, displayLength)}...`;
    }
    return imageURI;
  }, []);

  const getCachePath = useCallback(async (image: AppImageMetaData) => {
    if (image.mode === AppImageMode.api || image.mode === AppImageMode.identicon) {
      return await FastImage.getCachePath({uri: AppImageMetaData.getSourceURI(image)});
    }
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
          <HyperlinkText disableLinkInterpolation={true}>
            <Text selectable={true} style={styles.infoText} variant={'bodySmall'}>
              URI: {getDisplayURI(image)}
            </Text>
          </HyperlinkText>
          <Text selectable={true} style={styles.infoText} variant={'bodySmall'}>
            Cache Path: {getCachePath(image)}
          </Text>
        </PaddedContentView>
      )}
    </View>
  );
};
