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
  description: 'Server connection events.',
};

/**
 * Notification channel for mandatory foreground service notifications.
 * This is its own because as of Android 13 users can now dismiss Foreground
 * Service notifications. Since they no longer need to persist the user could
 * opt to never see them ever again.
 *
 * Notifee currently does not support setting FOREGROUND_SERVICE_IMMEDIATE into
 * setForegroundServiceBehavior() which is needed to display Foreground Service
 * notifications immediately, rather than without a 10-second delay.
 * We must deal with it.
 * https://developer.android.com/guide/components/foreground-services
 * https://github.com/invertase/notifee/issues/272
 */
export const serviceChannel: AndroidChannel = {
  id: 'service',
  name: 'Service',
  groupId: systemChannelGroup.id,
  description: 'Background processes associated with Tricordarr.',
  badge: false,
  vibration: false,
};

/**
 * Notification channel for Seamail content.
 */
export const seamailChannel: AndroidChannel = {
  id: 'seamail',
  name: 'Seamail',
  groupId: contentChannelGroup.id,
  description: 'Seamail content from the Twitarr server.',
};

/**
 * Notification channel for LFG content.
 */
export const lfgChannel: AndroidChannel = {
  id: 'lfg',
  name: 'LFG',
  groupId: contentChannelGroup.id,
  description: 'LFG content from the Twitarr server.',
};

/**
 * Notification channel for announcements.
 */
export const announcementsChannel: AndroidChannel = {
  id: 'announcements',
  name: 'Announcements',
  groupId: contentChannelGroup.id,
  description: 'Announcements from the Twitarr server.',
};

/**
 * Notification channel for Seamail content.
 */
export const forumChannel: AndroidChannel = {
  id: 'forums',
  name: 'Forums',
  groupId: contentChannelGroup.id,
  description: 'Forum content from the Twitarr server.',
};

/**
 * Notification channel for KrakenTalk calls.
 */
export const krakentalkChannel: AndroidChannel = {
  id: 'krakentalk',
  name: 'Krakentalk',
  groupId: contentChannelGroup.id,
  description: 'KrakenTalk calls through Twitarr.',
};

/**
 * Setup function to ensure that the channels and their groups exist.
 */
export async function setupChannels() {
  await setupChannelGroups();
  await notifee.createChannel(connectionChannel);
  await notifee.createChannel(serviceChannel);
  await notifee.createChannel(seamailChannel);
  await notifee.createChannel(lfgChannel);
  await notifee.createChannel(announcementsChannel);
  await notifee.createChannel(forumChannel);
  await notifee.createChannel(krakentalkChannel);
}
