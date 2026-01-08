import Clipboard from '@react-native-clipboard/clipboard';

import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {isIOS} from '#src/Libraries/Platform/Detection';

/**
 * Hook for copying text to the clipboard.
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

  return {setString};
};
