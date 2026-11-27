import {PastedFile} from '@mattermost/react-native-paste-input';
import {File} from 'expo-file-system';
import {useFormikContext} from 'formik';

import {useClientSettings} from '#src/Context/Contexts/ClientSettingsContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useClipboard} from '#src/Hooks/useClipboard';
import {assertBase64WithinSizeLimit} from '#src/Libraries/ImageSize';
import {createLogger} from '#src/Libraries/Logger';
import {ImageUploadData, PostContentData} from '#src/Structs/ControllerStructs';

const logger = createLogger('useContentImageAttachment.ts');

interface UseContentImageAttachmentOptions {
  maxPhotos: number;
  fieldName?: string;
  /** False for composers that take no photos (Seamail), so pasted images are refused. */
  enablePhotos?: boolean;
}

/**
 * Delete a pasted file from the cache. The paste library writes each pasted file there and
 * never cleans up after itself.
 *
 * @param file The file reported by the paste event.
 */
const deletePastedFile = (file: PastedFile) => {
  try {
    new File(file.uri).delete();
  } catch (err) {
    logger.warn('Could not delete pasted file', file.uri, err);
  }
};

/**
 * Read a pasted file to base64, then delete it.
 *
 * @param file The file reported by the paste event.
 * @returns The file's contents as base64.
 */
const readPastedFile = async (file: PastedFile): Promise<string> => {
  try {
    return await new File(file.uri).base64();
  } finally {
    deletePastedFile(file);
  }
};

/**
 * The notice shown when an attachment would exceed the form's photo limit.
 *
 * @param maxPhotos The form's photo limit.
 */
const getMaxPhotosMessage = (maxPhotos: number) =>
  `You can attach at most ${maxPhotos} photo${maxPhotos === 1 ? '' : 's'}.`;

/**
 * Attaches images to the `images` field of the enclosing content post form. Shared by every way
 * an image gets in (camera, library, clipboard, and pasting into the text field) so they all
 * apply the same count and size limits. Must be used inside the form's Formik context.
 */
export const useContentImageAttachment = ({
  maxPhotos,
  fieldName = 'images',
  enablePhotos = true,
}: UseContentImageAttachmentOptions) => {
  const {values, setFieldValue} = useFormikContext<PostContentData>();
  const {maxImageSize} = useClientSettings();
  const {setSnackbarPayload} = useSnackbar();
  const {getImage} = useClipboard();

  /**
   * Append base64 images to the field, size-checking each one first.
   *
   * @param images Base64 image data to attach, in order.
   * @param shouldSaveToRoll Whether submission should save these to the camera roll (camera photos only).
   * @throws {Error} When an image is oversized or there is no room left; nothing is attached.
   */
  const attachBase64Images = (images: string[], shouldSaveToRoll: boolean = false) => {
    if (values.images.length + images.length > maxPhotos) {
      throw new Error(getMaxPhotosMessage(maxPhotos));
    }
    images.forEach(image => assertBase64WithinSizeLimit(image, maxImageSize));
    const additions: ImageUploadData[] = images.map(image => ({image, _shouldSaveToRoll: shouldSaveToRoll}));
    void setFieldValue(fieldName, values.images.concat(additions));
  };

  /**
   * Attach the image currently on the clipboard.
   *
   * @returns True when an image was attached.
   */
  const pasteFromClipboard = async (): Promise<boolean> => {
    try {
      const image = await getImage();
      if (!image) {
        setSnackbarPayload({message: 'No image found on the clipboard.', messageType: 'info'});
        return false;
      }
      attachBase64Images([image]);
      return true;
    } catch (err) {
      logger.error('Failed to paste image from clipboard', err);
      setSnackbarPayload({message: err instanceof Error ? err.message : String(err), messageType: 'error'});
      return false;
    }
  };

  /**
   * Handle files pasted into the text field (or inserted from the Android keyboard). Non-image
   * files are skipped, and images past the photo limit are dropped, each with a notice.
   *
   * @param error Error reported by the paste library, if any.
   * @param files The pasted files.
   */
  const attachPastedFiles = async (error: string | null | undefined, files: PastedFile[]) => {
    if (error) {
      logger.error('Paste failed', error);
      setSnackbarPayload({message: error, messageType: 'error'});
      return;
    }
    if (!enablePhotos) {
      files.forEach(deletePastedFile);
      setSnackbarPayload({message: "Images can't be attached here.", messageType: 'info'});
      return;
    }
    const imageFiles = files.filter(file => file.type?.startsWith('image/'));
    const remaining = Math.max(maxPhotos - values.images.length, 0);
    const accepted = imageFiles.slice(0, remaining);
    files.filter(file => !accepted.includes(file)).forEach(deletePastedFile);
    try {
      const images = await Promise.all(accepted.map(readPastedFile));
      if (images.length > 0) {
        attachBase64Images(images);
      }
    } catch (err) {
      logger.error('Failed to attach pasted image', err);
      setSnackbarPayload({message: err instanceof Error ? err.message : String(err), messageType: 'error'});
      return;
    }
    if (imageFiles.length < files.length) {
      setSnackbarPayload({message: 'Only images can be attached.', messageType: 'info'});
    } else if (accepted.length < imageFiles.length) {
      setSnackbarPayload({message: getMaxPhotosMessage(maxPhotos), messageType: 'info'});
    }
  };

  return {attachBase64Images, pasteFromClipboard, attachPastedFiles};
};
