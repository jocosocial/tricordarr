import ImageView from 'react-native-image-viewing';
import React, {Dispatch, SetStateAction, useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {IconButton} from 'react-native-paper';
import {AppIcons} from '../../libraries/Enums/Icons';
import {ImageViewerSnackbar} from '../Snackbars/ImageViewerSnackbar';
import {useStyles} from '../Context/Contexts/StyleContext';
import {ImageQueryData} from '../../libraries/Types';
import {saveImageToLocal} from '../../libraries/Storage/ImageStorage';
import {ImageViewerFooterView} from '../Views/ImageViewerFooterView';
import {useAppTheme} from '../../styles/Theme';

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
        <View style={[commonStyles.flexRow, commonStyles.justifyContentEnd]}>
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
    [
      commonStyles.flexRow,
      commonStyles.justifyContentEnd,
      enableDownload,
      saveImage,
      setIsVisible,
      theme.colors.onImageViewer,
    ],
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
