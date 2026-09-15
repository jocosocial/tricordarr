import {Alert} from 'react-native';

/**
 * Confirms clearing webview cookies, which may require signing in again.
 */
export const alertClearCookies = (onConfirm: () => void, onCancel?: () => void): void => {
  Alert.alert('Clear Cookies', 'Are you sure you want to clear all webview cookies? You may need to sign in again.', [
    {text: 'Close', style: 'cancel', onPress: onCancel},
    {text: 'Clear', style: 'destructive', onPress: onConfirm},
  ]);
};
