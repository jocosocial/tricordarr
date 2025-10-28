import React from 'react';
import {ImageRequireSource, ImageURISource, Platform, StyleSheet, View} from 'react-native';
import {IconButton, Text} from 'react-native-paper';

import {HyperlinkText} from '#src/Components/Text/HyperlinkText';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {useAppTheme} from '#src/Styles/Theme';
import {APIImageV2Data} from '#src/Types/APIImageV2Data';

interface ImageViewerHeaderViewProps {
  enableDownload: boolean;
  onSave: () => void;
  onClose: () => void;
  viewerImages: APIImageV2Data[];
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
            MIME Type: {viewerImages[imageIndex].mimeType}
          </Text>
          <Text selectable={true} style={styles.infoText} variant={'bodySmall'}>
            Data URI:{' '}
            {viewerImages[imageIndex].dataURI ? `${viewerImages[imageIndex].dataURI.substring(0, 40)}...` : undefined}
          </Text>
          <HyperlinkText disableLinkInterpolation={true}>
            <Text selectable={true} style={styles.infoText} variant={'bodySmall'}>
              Full URI: {viewerImages[imageIndex].fullURI}
            </Text>
          </HyperlinkText>
          {typeof imageViewImages[imageIndex] === 'object' && 'uri' in imageViewImages[imageIndex] && (
            <HyperlinkText disableLinkInterpolation={true}>
              <Text selectable={true} style={styles.infoText} variant={'bodySmall'}>
                Render URI: {imageViewImages[imageIndex].uri}
              </Text>
            </HyperlinkText>
          )}
        </PaddedContentView>
      )}
    </View>
  );
};
