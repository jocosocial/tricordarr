import {Alert} from 'react-native';

/**
 * Native Alert confirm for logout. Unlike the previous Modal, this dismisses
 * as soon as the user taps Log Out, so the screen behind is immediately
 * visible. Callers must freeze UI (onLogoutStart) before teardown and delay
 * navigation (onLoggedOut) until after performSignOut. See ConfirmLogoutOptions.
 */
export const alertLogout = (allDevices: boolean, onConfirm: () => void, onCancel?: () => void): void => {
  Alert.alert('Log Out', allDevices ? 'Confirm log out all of your devices?' : 'Confirm log out this device?', [
    {text: 'Close', style: 'cancel', onPress: onCancel},
    {text: 'Log Out', style: 'destructive', onPress: onConfirm},
  ]);
};

/**
 * Confirms permanently deleting a saved session.
 */
export const alertDeleteSession = (onConfirm: () => void, onCancel?: () => void): void => {
  Alert.alert('Delete Session', 'Are you sure you want to delete this session? This action cannot be undone.', [
    {text: 'Close', style: 'cancel', onPress: onCancel},
    {text: 'Delete', style: 'destructive', onPress: onConfirm},
  ]);
};
