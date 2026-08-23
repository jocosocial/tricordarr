import {Alert} from 'react-native';

/**
 * Explains that images are disabled by the server admins.
 */
export const alertImagesDisabled = (): void => {
  Alert.alert(
    'Help',
    'Images have been disabled by the server admins. This could be for all clients or just Tricordarr. Check the forums, announcements, or Info Desk for more details.',
  );
};
