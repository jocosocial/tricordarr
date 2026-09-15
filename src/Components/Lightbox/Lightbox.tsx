import {useBackHandler} from '@react-native-community/hooks';
import React, {useCallback, useState} from 'react';

import ImageView from '#src/Components/Lightbox/pager/ImagePager';
import {useLightbox, useLightboxControls} from '#src/Components/Lightbox/state';
import {type LightboxImage} from '#src/Components/Lightbox/types';
import {useSaveImage} from '#src/Hooks/useSaveImage';
import {useShareImage} from '#src/Hooks/useShareImage';
import {createLogger} from '#src/Libraries/Logger';
import {StringOrError} from '#src/Types';

const logger = createLogger('Lightbox.tsx');

/**
 * Global image lightbox overlay. Mounted once from ShellProvider and driven
 * by useLightboxControls().openLightbox().
 */
export const Lightbox = () => {
  const {activeLightbox} = useLightbox();
  const {closeLightbox} = useLightboxControls();
  const saveImage = useSaveImage();
  const shareImage = useShareImage();
  const [viewerMessage, setViewerMessage] = useState<StringOrError>();

  const onClose = useCallback(() => {
    closeLightbox();
    setViewerMessage(undefined);
  }, [closeLightbox]);

  /**
   * Close the lightbox on Android Back. The pager is a View overlay, not a Modal,
   * so the system does not deliver onRequestClose for hardware Back.
   */
  const handleLightboxBackPress = useCallback(() => {
    if (activeLightbox) {
      onClose();
      return true;
    }
    return false;
  }, [activeLightbox, onClose]);

  useBackHandler(handleLightboxBackPress);

  const onPressSave = useCallback(
    async (image: LightboxImage) => {
      try {
        await saveImage(image.metadata);
        setViewerMessage('Saved to camera roll.');
      } catch (error: unknown) {
        logger.error('Failed to save image:', error);
        setViewerMessage(error instanceof Error ? error : new Error(String(error)));
      }
    },
    [saveImage],
  );

  const onPressShare = useCallback(
    async (image: LightboxImage) => {
      try {
        await shareImage(image.metadata);
      } catch (error: unknown) {
        logger.error('Failed to share image:', error);
        setViewerMessage(error instanceof Error ? error : new Error(String(error)));
      }
    },
    [shareImage],
  );

  return (
    <ImageView
      lightbox={activeLightbox}
      onRequestClose={onClose}
      onPressSave={onPressSave}
      onPressShare={onPressShare}
      viewerMessage={viewerMessage}
      setViewerMessage={setViewerMessage}
    />
  );
};
