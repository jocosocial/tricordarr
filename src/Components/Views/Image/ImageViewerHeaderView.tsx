import React from 'react';
import {StyleSheet, View} from 'react-native';
import {IconButton} from 'react-native-paper';

import {ImageMetadataView} from '#src/Components/Views/Image/ImageMetadataView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {isIOS} from '#src/Libraries/Platform/Detection';
import {AppImageMetaData} from '#src/Types/AppImageMetaData';

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
      ...(isIOS && commonStyles.safePaddingTop),
    },
  });

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
      {showMetadata && image && <ImageMetadataView image={image} />}
    </View>
  );
};
