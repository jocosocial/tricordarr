import FastImage from '@d11/react-native-fast-image';
import React, {Dispatch, SetStateAction, useCallback, useEffect, useState} from 'react';
import {ImageRequireSource, ImageURISource} from 'react-native';
import ImageView from 'react-native-image-viewing';

import {ImageViewerSnackbar} from '#src/Components/Snackbars/ImageViewerSnackbar';
import {ImageViewerFooterView} from '#src/Components/Views/Image/ImageViewerFooterView';
import {ImageViewerHeaderView} from '#src/Components/Views/Image/ImageViewerHeaderView';
import {saveImageDataURIToCameraRoll, saveImageURIToLocal} from '#src/Libraries/Storage/ImageStorage';
import {useAppTheme} from '#src/Styles/Theme';
import {APIImageV2Data} from '#src/Types/APIImageV2Data';

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

/**
 * Standard image viewer component to allow a user to view and download images.
 */
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

  /**
   * Function to get the FastImage cache URI for an image.
   */
  const getImageCacheURI = useCallback(async (image: APIImageV2Data) => {
    const cachePath = await FastImage.getCachePath({uri: image.fullURI});
    if (cachePath) {
      return `file://${cachePath}`;
    }
    return undefined;
  }, []);

  /**
   * Function to save an image to the camera roll.
   */
  const saveImage = useCallback(
    async (index: number) => {
      try {
        const image = viewerImages[index];
        if (image.dataURI) {
          await saveImageDataURIToCameraRoll(image);
          return;
        }
        const cacheURI = await getImageCacheURI(image);
        if (cacheURI) {
          await saveImageURIToLocal(image.fileName, cacheURI);
        } else {
          if (image.fullURI) {
            await saveImageURIToLocal(image.fileName, image.fullURI);
          }
          throw Error('No image URI to save');
        }
        setViewerMessage('Saved to camera roll.');
      } catch (error: any) {
        console.error(error);
        setViewerMessage(error);
      }
    },
    [viewerImages, getImageCacheURI],
  );

  /**
   * Callback to close the image viewer.
   */
  const onClose = useCallback(() => {
    setIsVisible(false);
    setViewerMessage(undefined);
  }, [setIsVisible, setViewerMessage]);

  /**
   * Render the header of the image viewer.
   */
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

  /**
   * Render the footer of the image viewer.
   */
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

  /**
   * Effect to set the current image index.
   */
  useEffect(() => {
    setCurrentImageIndex(initialIndex);
  }, [viewerImages, initialIndex]);

  /**
   * Effect to get the underlying image sources for the image viewer.
   */
  useEffect(() => {
    const getImages = async () => {
      const images = await Promise.all(
        viewerImages.map(async image => {
          if (image.dataURI) {
            return {uri: image.dataURI};
          }
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

  /**
   * If there are no viewer images, then don't render anything.
   */
  if (!viewerImages) {
    return <></>;
  }

  return (
    <ImageView
      images={imageViewImages}
      imageIndex={currentImageIndex}
      visible={isVisible}
      onRequestClose={onClose}
      HeaderComponent={viewerHeader}
      FooterComponent={viewerFooter}
      backgroundColor={theme.colors.constantBlack}
    />
  );
};
