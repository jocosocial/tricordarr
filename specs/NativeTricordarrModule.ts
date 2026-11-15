import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';
import type {EventEmitter} from 'react-native/Libraries/Types/CodegenTypes';

export interface Spec extends TurboModule {
  blurTextInImage(inputFilePath: string, callback: (newPath: string) => void): void;
  setupLocalPushManager(socketUrl: string, token: string, enable: boolean): void;
  setAppConfig(appConfigJson: string): void;
  getBackgroundPushManagerStatus(): Promise<{
    isActive?: boolean;
    isEnabled?: boolean;
    matchSSIDs: string[];
    providerConfiguration?: string;
  }>;
  getForegroundPushProviderStatus(): Promise<{
    lastPing?: string;
    isActive?: boolean;
    socketPingInterval?: number;
  }>;
  /**
   * Per-account state of the background notification socket. Native is the source of truth, so
   * JS pulls this on start/foreground; the events below are only for live updates.
   * `state` is one of Connecting, Open, Closed, Revoked, Stopped (iOS also reports its own values).
   * `failedCount` and `startedAt` are Android-only today. Timestamps are epoch milliseconds.
   */
  getWebsocketStatus(): Promise<
    Array<{
      accountID: string;
      state?: string;
      lastHealthcheckAt?: number;
      lastHealthcheckSuccess?: boolean;
      failedCount?: number;
      startedAt?: number;
      lastError?: string;
      lastErrorAt?: number;
    }>
  >;
  /**
   * Replaces the full list of accounts the background service connects for. `accountsJson` is a
   * JSON array of `{accountID, userID, username, serverUrl, urlPrefix, token, enabled, prefs}`
   * where `prefs` is `{pushNotifications: {[type]: boolean}, muteNotificationsUntil?: epochMs}`.
   * `accountID` is an opaque key native never parses. Call on sign-in/out/switch/prefs change.
   */
  syncPushAccounts(accountsJson: string): void;
  setPushAccountEnabled(accountID: string, enabled: boolean): void;
  /** Android: start the native foreground service. iOS: no-op, the extension is system managed. */
  startBackgroundService(): void;
  /** Android: stop the native foreground service. iOS: no-op. */
  stopBackgroundService(): void;
  /** Dismisses the displayed notification for one piece of content (Android; iOS removes the delivered one). */
  cancelContentNotification(accountID: string, contentID: string): void;
  /** Dismisses every displayed notification of an account that belongs to a parent object, e.g. a forum. */
  cancelSecondaryNotifications(accountID: string, secondaryContentID: string): void;
  /** Android only. A raw notification socket message received by the native service. */
  readonly onNotificationSocketEvent: EventEmitter<{accountID: string; raw: string}>;
  /** Android only. An account's background socket status changed. `status` is the JSON of one getWebsocketStatus entry. */
  readonly onBackgroundStatusChanged: EventEmitter<{accountID: string; status: string}>;
  /** Android only. Mark as Read was tapped on a notification and the server call succeeded. */
  readonly onMarkAsRead: EventEmitter<{accountID: string; contentID: string}>;
  clearLocalPushManager(): void;
  /**
   * Reads the native-side notification log (iOS only; see NotificationLog.swift). On Android the
   * native service appends to the same file JS reads, so this stays a no-op there. Returns
   * the raw JSONL contents, one entry per line, newest-last. Empty string if there is none.
   */
  getNotificationLog(): Promise<string>;
  /**
   * Clears the native-side notification log (iOS only).
   */
  clearNotificationLog(): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeTricordarrModule');
