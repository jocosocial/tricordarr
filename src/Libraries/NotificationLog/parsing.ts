import {NotificationLogEntry, NotificationLogSource} from '#src/Libraries/NotificationLog/types';

// Pure JSONL (de)serialization and filtering logic for the notification log, kept in its own
// module (no expo-file-system import) so it can be unit tested directly — importing
// expo-file-system transitively breaks under the project's current Jest transform config.

const RETENTION_DAYS = 7;
export const MAX_ENTRIES = 1000;
const DEDUP_WINDOW_MS = 5000;

// Raw JSON shape written to each line of the file. Dates are stored as ISO strings since
// JSON has no native Date type.
export interface StoredNotificationLogEntry {
  timestamp: string;
  type: string;
  contentID: string;
  info: string;
  source: NotificationLogSource;
  raw: string;
}

export const serializeEntry = (entry: StoredNotificationLogEntry): string => JSON.stringify(entry);

const parseLine = (line: string): NotificationLogEntry | null => {
  try {
    const parsed = JSON.parse(line) as StoredNotificationLogEntry;
    const timestamp = new Date(parsed.timestamp);
    if (isNaN(timestamp.getTime())) {
      return null;
    }
    return {
      timestamp,
      type: parsed.type as NotificationLogEntry['type'],
      contentID: parsed.contentID,
      info: parsed.info,
      source: parsed.source,
      raw: parsed.raw,
    };
  } catch {
    return null;
  }
};

/**
 * Parses raw JSONL text (one JSON object per line) into NotificationLogEntry objects,
 * silently dropping any line that fails to parse.
 */
export const parseJsonl = (text: string): NotificationLogEntry[] => {
  const entries: NotificationLogEntry[] = [];
  for (const line of text.split('\n')) {
    if (!line.trim()) {
      continue;
    }
    const entry = parseLine(line);
    if (entry) {
      entries.push(entry);
    }
  }
  return entries;
};

/**
 * Drops entries older than RETENTION_DAYS and collapses near-duplicate entries (same type,
 * contentID, and info within DEDUP_WINDOW_MS) that can occur on Android when the in-app
 * socket and the foreground-service socket are both briefly connected at once. Returns
 * newest-first.
 */
export const applyRetentionAndDedup = (entries: NotificationLogEntry[]): NotificationLogEntry[] => {
  const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
  const sorted = entries
    .filter(entry => entry.timestamp.getTime() >= cutoff)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const deduped: NotificationLogEntry[] = [];
  const lastSeenAt = new Map<string, number>();
  for (const entry of sorted) {
    const key = `${entry.type}|${entry.contentID}|${entry.info}`;
    const previous = lastSeenAt.get(key);
    if (previous !== undefined && previous - entry.timestamp.getTime() < DEDUP_WINDOW_MS) {
      continue;
    }
    lastSeenAt.set(key, entry.timestamp.getTime());
    deduped.push(entry);
  }
  return deduped;
};

/**
 * Keeps only the newest `MAX_ENTRIES` lines (JSONL lines are append-ordered, so "newest" is
 * "last").
 */
export const trimToMaxEntries = (lines: string[]): string[] => {
  if (lines.length <= MAX_ENTRIES) {
    return lines;
  }
  return lines.slice(lines.length - MAX_ENTRIES);
};
