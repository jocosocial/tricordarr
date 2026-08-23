import {Alert} from 'react-native';

/**
 * Confirms permanently deleting a forum post.
 */
export const alertDeletePost = (onConfirm: () => void, onCancel?: () => void): void => {
  Alert.alert('Delete Post', 'Confirm delete forum post? There is no recovery.', [
    {text: 'Close', style: 'cancel', onPress: onCancel},
    {text: 'Delete', style: 'destructive', onPress: onConfirm},
  ]);
};
