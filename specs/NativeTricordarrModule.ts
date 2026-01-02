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
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeTricordarrModule');
