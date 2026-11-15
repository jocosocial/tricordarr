import {Alert} from 'react-native';

/**
 * Confirms deleting a Quartermastarr item. Deleting is permanent from the owner's side.
 *
 * @param itemName The item's name, shown in the prompt.
 * @param onConfirm Called when the user confirms.
 */
export const alertDeleteQuartermasterItem = (itemName: string, onConfirm: () => void): void => {
  Alert.alert('Delete Item', `Delete "${itemName}"? Other people will no longer see it.`, [
    {text: 'Cancel', style: 'cancel'},
    {text: 'Delete', style: 'destructive', onPress: onConfirm},
  ]);
};
