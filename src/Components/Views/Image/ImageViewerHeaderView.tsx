import React from 'react';
import {Platform, StyleSheet, View} from 'react-native';
import {IconButton, Text} from 'react-native-paper';

import {HyperlinkText} from '#src/Components/Text/HyperlinkText';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {useAppTheme} from '#src/Styles/Theme';
import {ImageQueryData} from '#src/Types';

interface ImageViewerHeaderViewProps {
  enableDownload: boolean;
  onSave: () => void;
  onClose: () => void;
  viewerImages: ImageQueryData[];
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
    infoText: {
      ...commonStyles.marginBottomSmall,
      ...commonStyles.onImageViewer,
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
        <>
          <Text selectable={true} style={styles.infoText} variant={'bodyMedium'}>
            MIME Type: {viewerImages[imageIndex].mimeType}
          </Text>
          <HyperlinkText disableLinkInterpolation={true}>
            <Text selectable={true} style={styles.infoText} variant={'bodyMedium'}>
              Data URI: {viewerImages[imageIndex].dataURI}
            </Text>
          </HyperlinkText>
        </>
      )}
    </View>
  );
};
