import {Alert} from 'react-native';

/**
 * Confirms permanently deleting a performer profile from all events.
 */
export const alertDeleteProfile = (onConfirm: () => void, onCancel?: () => void): void => {
  Alert.alert(
    'Delete Profile',
    'Deleting your performer profile deletes it for all events. There is no recovery. Confirm?',
    [
      {text: 'Close', style: 'cancel', onPress: onCancel},
      {text: 'Delete', style: 'destructive', onPress: onConfirm},
    ],
  );
};
