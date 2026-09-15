import {Alert} from 'react-native';

/**
 * Confirms permanently deleting all log files.
 */
export const alertClearLogs = (onConfirm: () => void, onCancel?: () => void): void => {
  Alert.alert('Clear All Logs', 'Are you sure you want to delete all log files? This cannot be undone.', [
    {text: 'Close', style: 'cancel', onPress: onCancel},
    {text: 'Delete', style: 'destructive', onPress: onConfirm},
  ]);
};

/**
 * Warns that disabling pre-registration mode may cause unexpected behavior.
 */
export const alertDisablePreRegistration = (onConfirm: () => void, onCancel?: () => void): void => {
  Alert.alert(
    'Disable Pre-Registration',
    'Disabling pre-registration mode may cause unexpected behavior and voids your nonexistent warranty. Continue?',
    [
      {text: 'Close', style: 'cancel', onPress: onCancel},
      {text: 'Disable', onPress: onConfirm},
    ],
  );
};

/**
 * Confirms permanently hiding the Maintenance Mode warning banner.
 */
export const alertDismissMinAccessWarning = (onConfirm: () => void, onCancel?: () => void): void => {
  Alert.alert(
    'Hide Maintenance Mode Warning',
    'Permanently hide this warning? You can turn it back on later in Cruise Settings.',
    [
      {text: 'No', style: 'cancel', onPress: onCancel},
      {text: 'Yes', onPress: onConfirm},
    ],
  );
};
