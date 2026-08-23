import {Alert} from 'react-native';

import {FezType} from '#src/Enums/FezType';

/**
 * Confirms cancelling an LFG or event without deleting it, notifying participants.
 */
export const alertCancel = (fezType: FezType, onConfirm: () => void, onCancel?: () => void): void => {
  const noun = FezType.isLFGType(fezType) ? 'LFG' : 'event';
  Alert.alert(
    'Cancel',
    `Cancelling the ${noun} will mark it as not happening and notify all participants. The ${noun} won't be deleted; participants can still create and read posts.\n\nIf you haven't, you may want to make a post letting participants know why the event was cancelled.`,
    [
      {text: 'Close', style: 'cancel', onPress: onCancel},
      {text: 'Cancel Event', style: 'destructive', onPress: onConfirm},
    ],
  );
};

/**
 * Confirms permanently deleting an LFG or personal event.
 */
export const alertDelete = (onConfirm: () => void, onCancel?: () => void): void => {
  Alert.alert('Delete', 'You sure? There is no undo.', [
    {text: 'Close', style: 'cancel', onPress: onCancel},
    {text: 'Delete', style: 'destructive', onPress: onConfirm},
  ]);
};

/**
 * Confirms leaving an LFG or event, including waitlist consequences for LFGs.
 */
export const alertLeave = (title: string, fezType: FezType, onConfirm: () => void, onCancel?: () => void): void => {
  const waitlistWarning = FezType.isLFGType(fezType)
    ? " If this group has limited capacity you may not be able to re-join. If you were on the wait list you'll lose your place in the queue."
    : '';
  Alert.alert('Leave', `Leave ${title}?${waitlistWarning}`, [
    {text: 'Close', style: 'cancel', onPress: onCancel},
    {text: 'Leave', style: 'destructive', onPress: onConfirm},
  ]);
};
