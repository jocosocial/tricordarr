import {Alert} from 'react-native';

/**
 * Warns that opening View in Context for a Seamail post enters a private conversation.
 */
export const alertViewPrivateSeamail = (onConfirm: () => void, onCancel?: () => void): void => {
  Alert.alert('Private Seamail', 'You are about to view a private Seamail conversation.', [
    {text: 'Cancel', style: 'cancel', onPress: onCancel},
    {text: 'Proceed', onPress: onConfirm},
  ]);
};

/**
 * Confirms permanently deleting moderated content.
 */
export const alertDeleteModeratedContent = (
  contentLabel: string,
  onConfirm: () => void,
  onCancel?: () => void,
): void => {
  Alert.alert('Delete Confirmation', `Are you sure you want to delete this ${contentLabel}? There is no recovery.`, [
    {text: 'Cancel', style: 'cancel', onPress: onCancel},
    {text: 'Delete', style: 'destructive', onPress: onConfirm},
  ]);
};

/**
 * Confirms removing a participant from a personal event.
 */
export const alertRemovePersonalEventMember = (
  username: string,
  onConfirm: () => void,
  onCancel?: () => void,
): void => {
  Alert.alert('Remove Participant', `Remove @${username} from this personal event?`, [
    {text: 'Cancel', style: 'cancel', onPress: onCancel},
    {text: 'Remove', style: 'destructive', onPress: onConfirm},
  ]);
};

/**
 * Confirms deleting a Micro Karaoke snippet. By design, users cannot delete their own clips.
 */
export const alertDeleteMicroKaraokeSnippet = (onConfirm: () => void, onCancel?: () => void): void => {
  Alert.alert(
    'Delete Clip',
    'Delete this Micro Karaoke clip? The song will need a replacement clip and will no longer be approved.',
    [
      {text: 'Cancel', style: 'cancel', onPress: onCancel},
      {text: 'Delete', style: 'destructive', onPress: onConfirm},
    ],
  );
};

/**
 * Confirms approving a completed Micro Karaoke song. Approval notifies contributors and cannot be undone.
 */
export const alertApproveMicroKaraokeSong = (onConfirm: () => void, onCancel?: () => void): void => {
  Alert.alert(
    'Approve Song',
    'Approve this song for viewing? Contributors will be notified. This cannot be undone; reject a clip instead if a problem appears later.',
    [
      {text: 'Cancel', style: 'cancel', onPress: onCancel},
      {text: 'Approve', onPress: onConfirm},
    ],
  );
};
