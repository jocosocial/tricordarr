import React from 'react';
import {ImageRequireSource, ImageURISource, Platform, StyleSheet, View} from 'react-native';
import {IconButton, Text} from 'react-native-paper';

import {HyperlinkText} from '#src/Components/Text/HyperlinkText';
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
            dataURI:{' '}
            {viewerImages[imageIndex].dataURI ? `${viewerImages[imageIndex].dataURI.substring(0, 40)}...` : undefined}
          </Text>
          <HyperlinkText disableLinkInterpolation={true}>
            <Text selectable={true} style={styles.infoText} variant={'bodySmall'}>
              fullURI: {viewerImages[imageIndex].fullURI}
            </Text>
          </HyperlinkText>
          {typeof imageViewImages[imageIndex] === 'object' && 'uri' in imageViewImages[imageIndex] && (
            <HyperlinkText disableLinkInterpolation={true}>
              <Text selectable={true} style={styles.infoText} variant={'bodySmall'}>
                [render]uri: {imageViewImages[imageIndex].uri}
              </Text>
            </HyperlinkText>
          )}
        </PaddedContentView>
      )}
    </View>
  );
};
