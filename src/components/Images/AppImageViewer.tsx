import ImageView from 'react-native-image-viewing';
import React, {Dispatch, SetStateAction, useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {IconButton} from 'react-native-paper';
import {AppIcons} from '../../Libraries/Enums/Icons';
import {ImageViewerSnackbar} from '../Snackbars/ImageViewerSnackbar';
import {useStyles} from '../Context/Contexts/StyleContext';
import {ImageQueryData} from '../../Libraries/Types';
import {saveImageToLocal} from '../../Libraries/Storage/ImageStorage';
import {ImageViewerFooterView} from '../Views/ImageViewerFooterView';
import {useAppTheme} from '../../Styles/Theme';
import {StyleSheet} from 'react-native';

interface AppImageViewerProps {
  initialIndex?: number;
  viewerImages?: ImageQueryData[];
  isVisible: boolean;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
  enableDownload?: boolean;
}

interface ImageViewerComponentProps {
  imageIndex: number;
}

export const AppImageViewer = ({
  isVisible,
  setIsVisible,
  viewerImages = [],
  initialIndex = 0,
  enableDownload = true,
}: AppImageViewerProps) => {
  const [viewerMessage, setViewerMessage] = useState<string>();
  const [currentImageIndex, setCurrentImageIndex] = useState(initialIndex);
  const {commonStyles} = useStyles();
  const theme = useAppTheme();

  const styles = StyleSheet.create({
    header: {
      ...commonStyles.flexRow,
      ...commonStyles.justifyContentEnd,
      ...commonStyles.imageViewerBackground,
    },
  });

  const saveImage = useCallback(
    async (index: number) => {
      try {
        const image = viewerImages[index];
        await saveImageToLocal(image);
        setViewerMessage('Saved to camera roll.');
      } catch (error: any) {
        console.error(error);
        setViewerMessage(error);
      }
    },
    [viewerImages],
  );

  const viewerHeader = useCallback(
    ({imageIndex}: ImageViewerComponentProps) => {
      return (
        <View style={styles.header}>
          {enableDownload && (
            <IconButton
              icon={AppIcons.download}
              onPress={() => saveImage(imageIndex)}
              iconColor={theme.colors.onImageViewer}
            />
          )}
          <IconButton
            icon={AppIcons.close}
            onPress={() => setIsVisible(false)}
            iconColor={theme.colors.onImageViewer}
          />
        </View>
      );
    },
    [enableDownload, saveImage, setIsVisible, styles.header, theme.colors.onImageViewer],
  );

  const viewerFooter = useCallback(
    ({imageIndex}: ImageViewerComponentProps) => {
      return (
        <>
          <ImageViewerSnackbar message={viewerMessage} setMessage={setViewerMessage} />
          <ImageViewerFooterView
            currentIndex={imageIndex}
            viewerImages={viewerImages}
            setImageIndex={setCurrentImageIndex}
          />
        </>
      );
    },
    [viewerImages, viewerMessage],
  );

  const onRequestClose = () => setIsVisible(false);

  useEffect(() => {
    setCurrentImageIndex(initialIndex);
  }, [viewerImages, initialIndex]);

  if (!viewerImages) {
    return <></>;
  }

  return (
    <ImageView
      images={viewerImages.map(image => {
        return {uri: image.dataURI};
      })}
      imageIndex={currentImageIndex}
      visible={isVisible}
      onRequestClose={onRequestClose}
      HeaderComponent={viewerHeader}
      FooterComponent={viewerFooter}
    />
  );
};
