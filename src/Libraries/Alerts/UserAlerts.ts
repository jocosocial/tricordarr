import {Alert} from 'react-native';

/**
 * Confirms blocking a user, hiding their content from you and yours from them.
 */
export const alertBlock = (hasModerator: boolean, onConfirm: () => void, onCancel?: () => void): void => {
  const message = hasModerator
    ? 'You are a Moderator and will continue to see their content. They will not see content from you.\n\nBlocking does hide your non-Mod alt accounts from this person, and vice-versa.'
    : 'You will not see content from each other.';
  Alert.alert('Block', message, [
    {text: 'Close', style: 'cancel', onPress: onCancel},
    {text: 'Block', style: 'destructive', onPress: onConfirm},
  ]);
};

/**
 * Confirms muting a user, hiding their content from you.
 */
export const alertMute = (hasModerator: boolean, onConfirm: () => void, onCancel?: () => void): void => {
  const message = hasModerator
    ? 'You are a Moderator and will continue to see their content.'
    : 'You will not see content from them.';
  Alert.alert('Mute', message, [
    {text: 'Close', style: 'cancel', onPress: onCancel},
    {text: 'Mute', style: 'destructive', onPress: onConfirm},
  ]);
};
