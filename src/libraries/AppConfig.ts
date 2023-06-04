import Config from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StorageKeys} from './Storage';

export interface AppConfig {
  serverUrl: string;
  urlPrefix: string;
  shipSSID: string;
  enableBackgroundWorker: boolean;
  notificationPollInterval: number;
  overrideWifiCheck: boolean;
}

const defaultAppConfig: AppConfig = {
  serverUrl: 'http://joco.hollandamerica.com',
  urlPrefix: '/api/v3',
  shipSSID: 'AndroidWifi',
  enableBackgroundWorker: true,
  notificationPollInterval: 300000,
  overrideWifiCheck: false,
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
