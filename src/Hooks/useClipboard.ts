import Clipboard from '@react-native-clipboard/clipboard';

import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {getBase64FromDataURI} from '#src/Libraries/ImageSize';
import {isIOS} from '#src/Libraries/Platform/Detection';

/**
 * Hook for reading and writing the clipboard.
 * This wrapper exists because iOS gives you no feedback that something happened.
 */
export const useClipboard = () => {
  const {setSnackbarPayload} = useSnackbar();

  const setString = (text: string) => {
    Clipboard.setString(text);
    if (isIOS) {
      setSnackbarPayload({
        message: 'Copied to clipboard',
        messageType: 'success',
        duration: 1500,
      });
    }
  };

  /**
   * Read the image on the clipboard as raw base64.
   * iOS re-encodes whatever image is there (HEIC, GIF, etc) as JPEG. Android has no JPEG
   * getter, so it returns the generic image, which is JPEG, PNG, or WEBP.
   *
   * @returns The base64 image data, or undefined when the clipboard holds no image.
   */
  const getImage = async (): Promise<string | undefined> => {
    const dataURI = isIOS ? await Clipboard.getImageJPG() : await Clipboard.getImage();
    return getBase64FromDataURI(dataURI);
  };

  return {setString, getImage};
};
