import {NotificationTypeData} from '#src/Structs/SocketStructs';

/**
 * The origin socket/process that recorded a NotificationLogEntry. Useful for debugging
 * duplicate or missing entries, since the notification socket can be owned by more than
 * one process at a time depending on platform and app state.
 */
export type NotificationLogSource = 'app' | 'fgs' | 'ios-native';

/**
 * A single event received on the notification websocket, recorded regardless of whether it
 * produced a push notification (muted, category disabled, and unhandled types are still
 * recorded here). See `src/Libraries/NotificationLog/index.ts`.
 */
export interface NotificationLogEntry {
  timestamp: Date;
  /// The NotificationTypeData key, or 'unknown' if it couldn't be determined.
  type: keyof typeof NotificationTypeData | 'unknown';
  contentID: string;
  info: string;
  source: NotificationLogSource;
  /// The raw socket JSON payload, as received.
  raw: string;
}
