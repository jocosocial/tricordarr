import notifee, {AndroidChannelGroup} from '@notifee/react-native';

/**
 * System channel is for notifications for Tricordarr-specific events.
 * These include mandatory foreground service notifications, server connection
 * events, self destruct, etc.
 */
export const systemChannelGroup: AndroidChannelGroup = {
  id: 'system',
  name: 'System',
  description: 'Tricordarr-specific events such as server connection issues and alerts.',
};

/**
 * Content channel is for notifications from Twitarr. Anything that is generated
 * from the server and should be presented to the user. "In general" this is the
 * stuff people care about.
 */
export const contentChannelGroup: AndroidChannelGroup = {
  id: 'content',
  name: 'Content',
  description: 'Content that comes from Twitarr itself such as Seamails or Twarrts.',
};

/**
 * Setup function to ensure that all expected channel groups exist.
 */
export async function setupChannelGroups() {
  await notifee.createChannelGroup(systemChannelGroup);
  await notifee.createChannelGroup(contentChannelGroup);
}
