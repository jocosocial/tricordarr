import notifee, {AndroidChannel} from '@notifee/react-native';
import {setupChannelGroups} from './ChannelGroups';
import {systemChannelGroup, contentChannelGroup} from './ChannelGroups';

/**
 * Notification channel for server connection events.
 */
export const connectionChannel: AndroidChannel = {
  id: 'connection',
  name: 'Connection',
  groupId: systemChannelGroup.id,
};

/**
 * Notification channel for mandatory foreground service notifications.
 * This is its own because as of Android 13 users can now dismiss Foreground
 * Service notifications. Since they no longer need to persist the user could
 * opt to never see them ever again.
 */
export const serviceChannel: AndroidChannel = {
  id: 'service',
  name: 'Service',
  groupId: systemChannelGroup.id,
};

/**
 * Notification channel for Seamail content.
 */
export const seamailChannel: AndroidChannel = {
  id: 'seamail',
  name: 'Seamail',
  groupId: contentChannelGroup.id,
};

/**
 * Setup function to ensure that the channels and their groups exist.
 */
export async function setupChannels() {
  await setupChannelGroups();
  await notifee.createChannel(connectionChannel);
  await notifee.createChannel(serviceChannel);
  await notifee.createChannel(seamailChannel);
}
