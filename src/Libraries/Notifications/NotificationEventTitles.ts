import {NotificationTypeData} from '#src/Structs/SocketStructs';

import notificationEvents from '#specs/NotificationEvents.json';

/**
 * User-facing title for a single notification event, matching the push notification title
 * where one is shown. Derived from `specs/NotificationEvents.json`, the table the generated Swift
 * and Kotlin code also come from, so they cannot drift.
 */
export const notificationEventTitles: Partial<Record<keyof typeof NotificationTypeData, string>> = Object.fromEntries(
  Object.entries(notificationEvents.events).map(([type, event]) => [type, event.title]),
);

/**
 * Returns the user-facing title for a notification log entry or filter row. Falls back to the
 * raw type string for unrecognized types (e.g. `unknown`).
 */
export const getNotificationTypeTitle = (type: string): string =>
  notificationEventTitles[type as keyof typeof NotificationTypeData] ?? type;
