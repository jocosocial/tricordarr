import {Alert} from 'react-native';

/**
 * Confirms deleting an announcement.
 */
export const alertDeleteAnnouncement = (onConfirm: () => void, onCancel?: () => void): void => {
  Alert.alert('Delete Announcement', 'This announcement will no longer be shown to users. Continue?', [
    {text: 'Close', style: 'cancel', onPress: onCancel},
    {text: 'Delete', style: 'destructive', onPress: onConfirm},
  ]);
};

/**
 * Confirms deleting a daily theme.
 */
export const alertDeleteDailyTheme = (onConfirm: () => void, onCancel?: () => void): void => {
  Alert.alert('Delete Daily Theme', 'Delete this daily theme? This cannot be undone.', [
    {text: 'Close', style: 'cancel', onPress: onCancel},
    {text: 'Delete', style: 'destructive', onPress: onConfirm},
  ]);
};

/**
 * Confirms applying a schedule update.
 */
export const alertApplySchedule = (onConfirm: () => void, onCancel?: () => void): void => {
  Alert.alert(
    'Apply Schedule Update',
    'This will create, update, and optionally delete events to match the uploaded schedule. Continue?',
    [
      {text: 'Close', style: 'cancel', onPress: onCancel},
      {text: 'Apply', style: 'destructive', onPress: onConfirm},
    ],
  );
};

/**
 * Confirms applying a bulk user import.
 */
export const alertApplyBulkUser = (onConfirm: () => void, onCancel?: () => void): void => {
  Alert.alert(
    'Apply Bulk User Import',
    'This writes user accounts from the uploaded archive into the database. The server should be in admin-only mode. Continue?',
    [
      {text: 'Close', style: 'cancel', onPress: onCancel},
      {text: 'Apply', style: 'destructive', onPress: onConfirm},
    ],
  );
};

/**
 * Confirms promoting a user to a higher access level.
 */
export const alertPromoteUser = (levelName: string, username: string, onConfirm: () => void): void => {
  Alert.alert('Promote User', `Promote ${username} to ${levelName}?`, [
    {text: 'Close', style: 'cancel'},
    {text: 'Promote', onPress: onConfirm},
  ]);
};

/**
 * Confirms demoting a privileged user back to Verified.
 */
export const alertDemoteUser = (username: string, onConfirm: () => void): void => {
  Alert.alert('Demote User', `Demote ${username} back to Verified? They will lose moderator/team privileges.`, [
    {text: 'Close', style: 'cancel'},
    {text: 'Demote', style: 'destructive', onPress: onConfirm},
  ]);
};

/**
 * Confirms removing a role from a user.
 */
export const alertRemoveRole = (roleName: string, username: string, onConfirm: () => void): void => {
  Alert.alert('Remove Role', `Remove the ${roleName} role from ${username}?`, [
    {text: 'Close', style: 'cancel'},
    {text: 'Remove', style: 'destructive', onPress: onConfirm},
  ]);
};

/**
 * Confirms deleting a hunt.
 */
export const alertDeleteHunt = (title: string, onConfirm: () => void): void => {
  Alert.alert('Delete Hunt', `Delete "${title}" and all of its puzzles? This cannot be undone.`, [
    {text: 'Close', style: 'cancel'},
    {text: 'Delete', style: 'destructive', onPress: onConfirm},
  ]);
};

/**
 * Confirms reloading karaoke or boardgame seed data.
 */
export const alertReloadSeed = (kind: string, onConfirm: () => void): void => {
  Alert.alert(`Reload ${kind}`, `Reload ${kind} from the server seed files? Existing catalog data will be replaced.`, [
    {text: 'Close', style: 'cancel'},
    {text: 'Reload', style: 'destructive', onPress: onConfirm},
  ]);
};

/**
 * Confirms reloading timezone change data from the seed file.
 */
export const alertReloadTimeZones = (onConfirm: () => void): void => {
  Alert.alert(
    'Reload Time Zone Data',
    'This replaces the scheduled time zone change table from the seed file. Continue?',
    [
      {text: 'Close', style: 'cancel'},
      {text: 'Reload', style: 'destructive', onPress: onConfirm},
    ],
  );
};
