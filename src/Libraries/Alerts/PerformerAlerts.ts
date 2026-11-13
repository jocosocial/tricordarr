import {Alert} from 'react-native';

/**
 * Confirms permanently deleting a performer profile from all events.
 */
export const alertDeleteProfile = (onConfirm: () => void, onCancel?: () => void): void => {
  Alert.alert(
    'Delete Profile',
    'Deleting your performer profile deletes it for all events. There is no recovery. Confirm?',
    [
      {text: 'Close', style: 'cancel', onPress: onCancel},
      {text: 'Delete', style: 'destructive', onPress: onConfirm},
    ],
  );
};

/**
 * Confirms manually linking a performer to an event (TwitarrTeam).
 */
export const alertLinkPerformer = (performerName: string, eventTitle: string, onConfirm: () => void): void => {
  Alert.alert('Link Performer', `Link ${performerName} to ${eventTitle}?`, [
    {text: 'Cancel', style: 'cancel'},
    {text: 'Link', onPress: onConfirm},
  ]);
};
