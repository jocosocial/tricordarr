import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

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
  getWebsocketStatus(): Promise<{
    state?: string;
    lastHealthcheckAt?: string;
    lastHealthcheckSuccess?: boolean;
    lastError?: string;
    lastErrorAt?: string;
  }>;
  clearLocalPushManager(): void;
  /**
   * Reads the native-side notification log (iOS only; see NotificationLog.swift). Returns
   * the raw JSONL contents, one entry per line, newest-last. Empty string if there is none.
   */
  getNotificationLog(): Promise<string>;
  /**
   * Clears the native-side notification log (iOS only).
   */
  clearNotificationLog(): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeTricordarrModule');
