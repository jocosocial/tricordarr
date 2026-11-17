import {PushNotificationConfig} from '#src/Libraries/AppConfig';
import {createLogger} from '#src/Libraries/Logger';
import {getCurrentPushAccountID} from '#src/Libraries/Notifications/Push/PushAccounts';
import {NotificationTypeData} from '#src/Structs/SocketStructs';

import NativeTricordarrModule from '#specs/NativeTricordarrModule';

const logger = createLogger('Content');

export interface ContentNotificationCategory {
  title: string;
  disabled?: boolean;
  description?: string;
  configKey: `${NotificationTypeData}`;
}

export type ContentNotificationCategories = {
  [_key in keyof PushNotificationConfig]: ContentNotificationCategory;
};

/**
 * The push notification setting for each type. Title and description come from
 * specs/NotificationEvents.json, and a deprecated type's setting is disabled.
 */
export const contentNotificationCategories = Object.fromEntries(
  Object.entries(NotificationTypeData.specs).map(([type, spec]) => [
    type,
    {configKey: type, title: spec.title, description: spec.doc, disabled: spec.deprecated},
  ]),
) as ContentNotificationCategories;

export interface ContentNotificationSection {
  title: string;
  categories: ContentNotificationCategory[];
}

/**
 * The settings grouped by the channel each type posts to, sorted by name. Types that never post a
 * notification have no channel and go in a final "Other" section.
 */
export const contentNotificationSections: ContentNotificationSection[] = (() => {
  const byTitle = (a: ContentNotificationCategory, b: ContentNotificationCategory) => a.title.localeCompare(b.title);
  const channels = new Map<NotificationTypeData.Channel, ContentNotificationCategory[]>();
  const other: ContentNotificationCategory[] = [];
  Object.entries(NotificationTypeData.specs).forEach(([type, spec]) => {
    const category = contentNotificationCategories[type as NotificationTypeData];
    if (spec.channel) {
      channels.set(spec.channel, [...(channels.get(spec.channel) ?? []), category]);
    } else {
      other.push(category);
    }
  });
  const sections = [...channels.entries()]
    .map(([channel, categories]) => ({title: NotificationTypeData.channelNames[channel], categories}))
    .sort((a, b) => a.title.localeCompare(b.title));
  if (other.length > 0) {
    sections.push({title: 'Other', categories: other});
  }
  return sections.map(section => ({...section, categories: [...section.categories].sort(byTitle)}));
})();

/**
 * Dismiss the active account's displayed notification for one piece of content. The native push
 * provider posted it, scoped to the account, so only native can find it.
 * Never throws; a failure to dismiss is only logged.
 */
export async function cancelContentNotification(contentID: string) {
  try {
    const accountID = await getCurrentPushAccountID();
    if (accountID) {
      NativeTricordarrModule.cancelContentNotification(accountID, contentID);
    }
  } catch (error) {
    logger.error('Failed to cancel content notification', error);
  }
}

/**
 * Dismiss the active account's displayed notifications that belong to the given secondary object
 * (e.g. a forum). Some notifications are keyed by their own content ID (e.g. a post ID), so they
 * are matched on the `secondaryContentID` (the parent ID) that the server includes in the socket event.
 * @param secondaryContentID The parent object ID whose notifications should be cancelled.
 */
export async function cancelSecondaryNotifications(secondaryContentID: string) {
  try {
    const accountID = await getCurrentPushAccountID();
    if (accountID) {
      NativeTricordarrModule.cancelSecondaryNotifications(accountID, secondaryContentID);
    }
  } catch (error) {
    logger.error('Failed to cancel secondary notifications', error);
  }
}
