import FastImage from '@d11/react-native-fast-image';
import React, {Dispatch, SetStateAction, useCallback, useEffect, useState} from 'react';
import {ImageRequireSource, ImageURISource} from 'react-native';
import ImageView from 'react-native-image-viewing';

import {ImageViewerSnackbar} from '#src/Components/Snackbars/ImageViewerSnackbar';
import {ImageViewerFooterView} from '#src/Components/Views/Image/ImageViewerFooterView';
import {ImageViewerHeaderView} from '#src/Components/Views/Image/ImageViewerHeaderView';
import {saveImageDataURIToCameraRoll, saveImageURIToLocal} from '#src/Libraries/Storage/ImageStorage';
import {useAppTheme} from '#src/Styles/Theme';
import {AppImageMetaData, AppImageMode} from '#src/Types/AppImageMetaData';

interface AppImageViewerProps {
  initialIndex?: number;
  viewerImages?: AppImageMetaData[];
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
  const getImageCacheURI = useCallback(async (image: AppImageMetaData) => {
    const cachePath = await FastImage.getCachePath({uri: image.fullURI});
    console.log('[AppImageViewer.tsx] cachePath', cachePath);
    if (cachePath) {
      return `file://${cachePath}`;
    }
    return undefined;
  }, []);

  /**
   * Function to save an image to the camera roll.
   * @TODO still need to enable this for [assets, data]. Confirm against [identicon, api].
   */
  const saveImage = useCallback(
    async (index: number) => {
      try {
        const imageMeta = viewerImages[index];
        if (imageMeta.dataURI) {
          await saveImageDataURIToCameraRoll(imageMeta);
        } else if (imageMeta.identiconURI) {
          await saveImageURIToLocal(imageMeta.fileName, imageMeta.identiconURI);
        } else {
          const cacheURI = await getImageCacheURI(imageMeta);
          if (cacheURI) {
            await saveImageURIToLocal(imageMeta.fileName, cacheURI);
          } else {
            if (imageMeta.fullURI) {
              await saveImageURIToLocal(imageMeta.fileName, imageMeta.fullURI);
            }
            throw Error('No image URI to save');
          }
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
        />
      );
    },
    [enableDownload, saveImage, onClose, viewerImages],
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
    console.log('[AppImageViewer.tsx] Triggering useEffect to get images');
    const getImages = async () => {
      const images = await Promise.all(
        viewerImages.map(async image => {
          if (image.mode === AppImageMode.api) {
            const cacheURI = await getImageCacheURI(image);
            if (cacheURI) {
              return {uri: cacheURI};
            }
            return {uri: image.fullURI};
          } else {
            return {uri: AppImageMetaData.getSourceURI(image)};
          }
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
