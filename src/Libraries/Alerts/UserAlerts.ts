import {Alert} from 'react-native';

/**
 * Confirms blocking a user, hiding their content from you and yours from them.
 */
export const alertBlock = (hasModerator: boolean, onConfirm: () => void, onCancel?: () => void): void => {
  const moderatorNote = hasModerator
    ? "\n\nYou're a Moderator. You'll still see their content. Blocking does hide your non-Mod alt accounts from this person, and vice-versa."
    : '';
  Alert.alert(
    'Block',
    `Blocking a user will hide all that user's content from you, and also hide all your content from them.${moderatorNote}`,
    [
      {text: 'Close', style: 'cancel', onPress: onCancel},
      {text: 'Block', style: 'destructive', onPress: onConfirm},
    ],
  );
};

/**
 * Confirms muting a user, hiding their content from you.
 */
export const alertMute = (hasModerator: boolean, onConfirm: () => void, onCancel?: () => void): void => {
  const moderatorNote = hasModerator ? "\n\nYou're a Moderator. You'll still see their content." : '';
  Alert.alert('Mute', `Muting a user will hide all that user's content from you.${moderatorNote}`, [
    {text: 'Close', style: 'cancel', onPress: onCancel},
    {text: 'Mute', style: 'destructive', onPress: onConfirm},
  ]);
};
