import FastImage from '@d11/react-native-fast-image';
import React, {Dispatch, SetStateAction, useCallback, useEffect, useState} from 'react';
import {ImageRequireSource, ImageURISource} from 'react-native';
import ImageView from 'react-native-image-viewing';

import {ImageViewerSnackbar} from '#src/Components/Snackbars/ImageViewerSnackbar';
import {ImageViewerFooterView} from '#src/Components/Views/Image/ImageViewerFooterView';
import {ImageViewerHeaderView} from '#src/Components/Views/Image/ImageViewerHeaderView';
import {saveImageURIToLocal} from '#src/Libraries/Storage/ImageStorage';
import {useAppTheme} from '#src/Styles/Theme';
import {APIImageV2Data} from '#src/Types';

interface AppImageViewerProps {
  initialIndex?: number;
  viewerImages?: APIImageV2Data[];
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

  const getImageCacheURI = useCallback(async (image: APIImageV2Data) => {
    const cachePath = await FastImage.getCachePath({uri: image.fullURI});
    if (cachePath) {
      return `file://${cachePath}`;
    }
    return undefined;
  }, []);

  const saveImage = useCallback(
    async (index: number) => {
      try {
        const image = viewerImages[index];
        const cacheURI = await getImageCacheURI(image);
        if (cacheURI) {
          await saveImageURIToLocal(image.fileName, cacheURI);
        } else {
          await saveImageURIToLocal(image.fileName, image.fullURI);
        }
        setViewerMessage('Saved to camera roll.');
      } catch (error: any) {
        console.error(error);
        setViewerMessage(error);
      }
    },
    [viewerImages, getImageCacheURI],
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
          imageViewImages={imageViewImages}
        />
      );
    },
    [enableDownload, saveImage, onClose, viewerImages, imageViewImages],
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
    const getImages = async () => {
      const images = await Promise.all(
        viewerImages.map(async image => {
          const cacheURI = await getImageCacheURI(image);
          if (cacheURI) {
            return {uri: cacheURI};
          }
          return {uri: image.fullURI};
        }),
      );
      setImageViewImages(images);
    };
    getImages();
  }, [viewerImages, getImageCacheURI]);

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
