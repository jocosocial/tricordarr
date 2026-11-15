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

/**
 * Confirms signing an account out of this device. Other accounts and the account's row stay.
 */
export const alertSignOutAccount = (label: string, onConfirm: () => void, onCancel?: () => void): void => {
  Alert.alert('Sign Out', `Sign ${label} out of this device? You can sign back in later.`, [
    {text: 'Close', style: 'cancel', onPress: onCancel},
    {text: 'Sign Out', style: 'destructive', onPress: onConfirm},
  ]);
};

/**
 * Confirms removing an account and its local data (token, preferences, cached content) from this device.
 */
export const alertRemoveAccount = (label: string, onConfirm: () => void, onCancel?: () => void): void => {
  Alert.alert(
    'Remove Account',
    `Remove ${label} from this device? Its saved login, settings and cached content are deleted. This does not delete the account on the server.`,
    [
      {text: 'Close', style: 'cancel', onPress: onCancel},
      {text: 'Remove', style: 'destructive', onPress: onConfirm},
    ],
  );
};

/**
 * Offers to log in as an alt account the user just created on the site.
 */
export const alertLoginAsAlt = (onConfirm: () => void, onCancel?: () => void): void => {
  Alert.alert(
    'Alt Account',
    'If you created an alt account, you can log in to it now. It is added beside this account.',
    [
      {text: 'Not Now', style: 'cancel', onPress: onCancel},
      {text: 'Log In', onPress: onConfirm},
    ],
  );
};
