import notifee, {AndroidChannel} from 'react-native-notify-kit';

import {contentChannelGroup, setupChannelGroups, systemChannelGroup} from '#src/Libraries/Notifications/ChannelGroups';

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

/*
 * KrakenTalk's call channels are deliberately absent here. They are created natively in
 * CallNotifications.ensureChannels() so that the ringing channel can be IMPORTANCE_HIGH (required
 * for a full-screen intent) and the in-call channel silent. That code also deletes the legacy
 * 'krakentalkcalls' and 'krakentalkmgmt' channels this file used to create -- channel settings are
 * immutable once created on a device, so the replacements had to take new ids. Do not recreate
 * them here or the delete will be undone on the next launch.
 */

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
  await notifee.createChannel(eventChannel);
}
