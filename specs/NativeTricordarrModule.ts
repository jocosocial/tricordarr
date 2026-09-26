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
   * Store the server base URL and auth token so native code can act on a KrakenTalk call
   * notification (currently Decline) while the JS runtime is not running. Android-only;
   * a no-op on iOS, where CallKit owns the incoming-call UI.
   */
  setCallCredentials(serverUrl: string, token: string): void;
  /**
   * Forget any credentials stored by setCallCredentials. Called on logout/session change.
   */
  clearCallCredentials(): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeTricordarrModule');
