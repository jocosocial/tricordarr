import {Directory, EncodingType, File, Paths} from 'expo-file-system';

import NativeTricordarrModule from '#specs/NativeTricordarrModule';
import {createLogger} from '#src/Libraries/Logger';
import {
  applyRetentionAndDedup,
  parseJsonl,
  serializeEntry,
  StoredNotificationLogEntry,
  trimToMaxEntries,
} from '#src/Libraries/NotificationLog/parsing';
import {NotificationLogEntry, NotificationLogSource} from '#src/Libraries/NotificationLog/types';
import {isIOS} from '#src/Libraries/Platform/Detection';
import {SocketNotificationData} from '#src/Structs/SocketStructs';

// Deliberately does not import APIClient (or anything that does) to avoid the
// Logger -> AppConfig -> APIClient -> QueryCacheStorage -> Logger require cycle documented
// in AppConfig.ts.

const logger = createLogger('NotificationLog');

const NOTIFICATION_LOG_DIR = new Directory(Paths.document, 'notifications');
const NOTIFICATION_LOG_FILE = new File(NOTIFICATION_LOG_DIR, 'notification-log.jsonl');

type NotificationLogListener = () => void;

const listeners = new Set<NotificationLogListener>();

/**
 * Subscribes to "a notification event was recorded" signals. Returns an unsubscribe function.
 */
export const subscribeToNotificationLog = (listener: NotificationLogListener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notifyNotificationLogListeners = (): void => {
  listeners.forEach(listener => {
    try {
      listener();
    } catch (error) {
      logger.error('Notification log listener threw', error);
    }
  });
};

const ensureLogDirectory = (): void => {
  try {
    if (!NOTIFICATION_LOG_DIR.exists) {
      NOTIFICATION_LOG_DIR.create({intermediates: true, idempotent: true});
    }
  } catch (error) {
    logger.error('Failed to create notification log directory', error);
  }
};

/**
 * Rewrites the JS-side log file keeping only the newest MAX_ENTRIES entries. Called after
 * every append so the file never grows unbounded (see docs/Storage.md: unbounded data goes
 * to the filesystem, but still needs a cap).
 */
const pruneIfNeeded = async (): Promise<void> => {
  try {
    if (!NOTIFICATION_LOG_FILE.exists) {
      return;
    }
    const text = await NOTIFICATION_LOG_FILE.text();
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const trimmed = trimToMaxEntries(lines);
    if (trimmed.length === lines.length) {
      return;
    }
    NOTIFICATION_LOG_FILE.write(trimmed.join('\n') + '\n', {encoding: EncodingType.UTF8});
  } catch (error) {
    logger.error('Failed to prune notification log', error);
  }
};

/**
 * Records a single notification-socket event to the persistent notification log, regardless
 * of whether it will produce a push notification. Call this before any mute/category
 * early-return so the log reflects everything the socket actually delivered. Fire-and-forget:
 * failures are logged and swallowed rather than thrown, since a logging problem should never
 * interrupt notification handling.
 *
 * On iOS the actual write is a no-op: the notification socket that matters (background
 * delivery) lives entirely in native Swift (see WebsocketNotifier.swift), and the in-app JS
 * socket only ever duplicates what the native side already recorded via the App Group-backed
 * native log. See docs/Code Notes.md for the full rationale.
 */
export const recordNotificationEvent = async (rawData: string, source: NotificationLogSource): Promise<void> => {
  if (isIOS) {
    notifyNotificationLogListeners();
    return;
  }
  try {
    const notificationData = JSON.parse(rawData) as SocketNotificationData;
    const type = SocketNotificationData.getType(notificationData);
    const entry: StoredNotificationLogEntry = {
      timestamp: new Date().toISOString(),
      type,
      contentID: notificationData.contentID ?? '',
      info: notificationData.info ?? '',
      source,
      raw: rawData,
    };
    ensureLogDirectory();
    if (!NOTIFICATION_LOG_FILE.exists) {
      NOTIFICATION_LOG_FILE.create({intermediates: true});
    }
    NOTIFICATION_LOG_FILE.write(serializeEntry(entry) + '\n', {encoding: EncodingType.UTF8, append: true});
    await pruneIfNeeded();
    notifyNotificationLogListeners();
  } catch (error) {
    logger.error('Failed to record notification event', error);
  }
};

/**
 * Reads every recorded notification event, merging the JS-recorded (Android) and
 * native-recorded (iOS) stores as applicable, applying retention and dedup, and returning
 * newest-first.
 */
export const getNotificationLogEntries = async (): Promise<NotificationLogEntry[]> => {
  const entries: NotificationLogEntry[] = [];

  if (isIOS) {
    try {
      const jsonl = await NativeTricordarrModule.getNotificationLog();
      entries.push(...parseJsonl(jsonl));
    } catch (error) {
      logger.error('Failed to read native notification log', error);
    }
  } else {
    try {
      if (NOTIFICATION_LOG_FILE.exists) {
        entries.push(...parseJsonl(await NOTIFICATION_LOG_FILE.text()));
      }
    } catch (error) {
      logger.error('Failed to read notification log', error);
    }
  }

  return applyRetentionAndDedup(entries);
};

/**
 * Clears the persistent notification log on the current platform.
 */
export const clearNotificationLog = async (): Promise<void> => {
  if (isIOS) {
    try {
      NativeTricordarrModule.clearNotificationLog();
    } catch (error) {
      logger.error('Failed to clear native notification log', error);
      throw error;
    }
    return;
  }
  try {
    if (NOTIFICATION_LOG_FILE.exists) {
      NOTIFICATION_LOG_FILE.delete();
    }
  } catch (error) {
    logger.error('Failed to clear notification log', error);
    throw error;
  }
};
