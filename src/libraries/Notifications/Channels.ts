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
  sound: 'default',
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
  sound: 'default',
};

/**
 * Notification channel for Seamail content.
 */
export const seamailChannel: AndroidChannel = {
  id: 'seamail',
  name: 'Seamail',
  groupId: contentChannelGroup.id,
  description: 'Seamail content from the Twitarr server.',
  sound: 'default',
};

/**
 * Notification channel for LFG content.
 */
export const lfgChannel: AndroidChannel = {
  id: 'lfg',
  name: 'LFG',
  groupId: contentChannelGroup.id,
  description: 'LFG content from the Twitarr server.',
  sound: 'default',
};

/**
 * Notification channel for announcements.
 */
export const announcementsChannel: AndroidChannel = {
  id: 'announcements',
  name: 'Announcements',
  groupId: contentChannelGroup.id,
  description: 'Announcements from the Twitarr server.',
  sound: 'default',
};

/**
 * Notification channel for Seamail content.
 */
export const forumChannel: AndroidChannel = {
  id: 'forums',
  name: 'Forums',
  groupId: contentChannelGroup.id,
  description: 'Forum content from the Twitarr server.',
  sound: 'default',
};

/**
 * Notification channel for KrakenTalk calls.
 */
export const callsChannel: AndroidChannel = {
  id: 'krakentalkcalls',
  name: 'KrakenTalk Calls',
  groupId: contentChannelGroup.id,
  description: 'KrakenTalk calls through Twitarr.',
  vibration: true,
  // https://www.ny-engineers.com/blog/temporal-3-fire-alarm-systems
  // https://notifee.app/react-native/docs/android/behaviour#vibration
  // The 1's are needed because it seems the docs have it backwards and it goes delay-vibrate
  // not vibrate-delay. They can't be 0's.
  vibrationPattern: [1, 500, 500, 500, 500, 500, 1500, 500, 500, 500, 500, 500, 1500, 1],
  sound: 'default',
};

export const callMgmtChannel: AndroidChannel = {
  id: 'krakentalkmgmt',
  name: 'KrakenTalk Call Management',
  groupId: contentChannelGroup.id,
  description: 'Signalling messages for KrakenTalk.',
  sound: 'default',
};

/**
 * Notification channel for Event reminders.
 */
export const eventChannel: AndroidChannel = {
  id: 'events',
  name: 'Events',
  groupId: contentChannelGroup.id,
  description: 'Event content from the Twitarr server.',
  sound: 'default',
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
  await notifee.createChannel(callsChannel);
  await notifee.createChannel(callMgmtChannel);
  await notifee.createChannel(eventChannel);
}
