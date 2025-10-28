import FastImage from '@d11/react-native-fast-image';
import React, {Dispatch, SetStateAction, useCallback, useEffect, useState} from 'react';
import {ImageRequireSource, ImageURISource} from 'react-native';
import ImageView from 'react-native-image-viewing';

import {ImageViewerSnackbar} from '#src/Components/Snackbars/ImageViewerSnackbar';
import {ImageViewerFooterView} from '#src/Components/Views/Image/ImageViewerFooterView';
import {ImageViewerHeaderView} from '#src/Components/Views/Image/ImageViewerHeaderView';
import {saveImageQueryToLocal, saveImageURIToLocal} from '#src/Libraries/Storage/ImageStorage';
import {useAppTheme} from '#src/Styles/Theme';
import {ImageQueryData} from '#src/Types';

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
  const [viewerMessage, setViewerMessage] = useState<string | Error>();
  const [currentImageIndex, setCurrentImageIndex] = useState(initialIndex);
  const [imageViewImages, setImageViewImages] = useState<(ImageURISource | ImageRequireSource)[]>([]);
  const theme = useAppTheme();

  const saveImage = useCallback(
    async (index: number) => {
      try {
        const image = viewerImages[index];
        if (image.base64) {
          await saveImageQueryToLocal(image);
        } else {
          // await saveImageURIToLocal(image.fileName, image.dataURI);
          const cachePath = await FastImage.getCachePath({uri: image.dataURI});
          if (cachePath) {
            await saveImageURIToLocal(image.fileName, `file://${cachePath}`);
          } else {
            await saveImageURIToLocal(image.fileName, image.dataURI);
          }
        }
        setViewerMessage('Saved to camera roll.');
      } catch (error: any) {
        console.error(error);
        setViewerMessage(error);
      }
    },
    [viewerImages],
  );

  const onClose = useCallback(() => {
    setIsVisible(false);
    setViewerMessage(undefined);
  }, [setIsVisible, setViewerMessage]);

  const viewerHeader = useCallback(
    ({imageIndex}: ImageViewerComponentProps) => {
      return (
        <ImageViewerHeaderView
          viewerImages={viewerImages}
          imageIndex={imageIndex}
          enableDownload={enableDownload}
          onSave={() => saveImage(imageIndex)}
          onClose={onClose}
        />
      );
    },
    [enableDownload, saveImage, onClose, viewerImages],
  );

  const viewerFooter = useCallback(
    ({imageIndex}: ImageViewerComponentProps) => {
      return (
        <>
          <ImageViewerSnackbar message={viewerMessage as string} setMessage={setViewerMessage} />
          <ImageViewerFooterView currentIndex={imageIndex} viewerImages={viewerImages} />
        </>
      );
    },
    [viewerImages, viewerMessage],
  );

  const onRequestClose = () => setIsVisible(false);

  useEffect(() => {
    setCurrentImageIndex(initialIndex);
  }, [viewerImages, initialIndex]);

  useEffect(() => {
    setImageViewImages(
      viewerImages.map(image => {
        return {uri: image.dataURI};
      }),
    );
  }, [viewerImages]);

  if (!viewerImages) {
    return <></>;
  }

  return (
    <ImageView
      images={imageViewImages}
      imageIndex={currentImageIndex}
      visible={isVisible}
      onRequestClose={onRequestClose}
      HeaderComponent={viewerHeader}
      FooterComponent={viewerFooter}
      backgroundColor={theme.colors.constantBlack}
    />
  );
};
