import Config from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StorageKeys} from './Storage';
import {NotificationType} from './Enums/Notifications';

export type PushNotificationConfig = {
  [key in keyof typeof NotificationType]: boolean;
};

export interface AppConfig {
  serverUrl: string;
  urlPrefix: string;
  shipSSID: string;
  enableBackgroundWorker: boolean;
  notificationPollInterval: number;
  overrideWifiCheck: boolean;
  enableNotificationSocket: boolean;
  enableFezSocket: boolean;
  pushNotifications: PushNotificationConfig;
  fgsWorkerHealthTimer: number;
}

const defaultAppConfig: AppConfig = {
  serverUrl: 'http://joco.hollandamerica.com',
  urlPrefix: '/api/v3',
  shipSSID: 'AndroidWifi',
  enableBackgroundWorker: true,
  notificationPollInterval: 300000,
  overrideWifiCheck: false,
  enableNotificationSocket: true,
  enableFezSocket: true,
  pushNotifications: {
    announcement: true,
    seamailUnreadMsg: true,
    fezUnreadMsg: true,
    alertwordTwarrt: false,
    alertwordPost: true,
    twarrtMention: false,
    forumMention: true,
    nextFollowedEventTime: true,
  },
  fgsWorkerHealthTimer: 10000, // 10000 == 10 seconds
};

/**
 * Generates an AppConfig object from the defaults and React Native Config "env vars".
 */
const getInitialAppConfig = () => {
  let config = defaultAppConfig;
  if (Config.SERVER_URL) {
    config.serverUrl = Config.SERVER_URL;
  }
  if (Config.SHIP_SSID) {
    config.shipSSID = Config.SHIP_SSID;
  }
  return config;
};

/**
 * Returns the current AppConfig, either from storage or generates from default + "env vars".
 */
export const getAppConfig = async () => {
  let rawConfig = await AsyncStorage.getItem(StorageKeys.APP_CONFIG);
  if (!rawConfig) {
    const defaultConfig = getInitialAppConfig();
    await AsyncStorage.setItem(StorageKeys.APP_CONFIG, JSON.stringify(defaultConfig));
    return defaultConfig;
  }
  return JSON.parse(rawConfig) as AppConfig;
};
