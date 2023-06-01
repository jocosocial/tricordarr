// https://www.sohamkamani.com/javascript/enums/
// https://12factor.net/config
// https://medium.com/differential/managing-configuration-in-react-native-cd2dfb5e6f7b
// https://github.com/luggit/react-native-config

import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';
import EncryptedStorage from 'react-native-encrypted-storage';
import {StorageKeys} from './Storage';

export class AppSettings {
  key: string;
  isSecure: boolean;
  dataType: any;
  title: string;
  description: string;

  // @TODO make these consistent
  // @TODO make datatype mean something
  static SERVER_URL = new AppSettings('SERVER_URL', false, String, 'Server URL', 'URL of the Twitarr server.');
  static URL_PREFIX = new AppSettings('URL_PREFIX');
  static TOKEN_STRING_DATA = new AppSettings(StorageKeys.TOKEN_STRING_DATA, true);
  static APP_CONFIG = new AppSettings(StorageKeys.APP_CONFIG);
  static SHIP_SSID = new AppSettings(
    'SHIP_SSID',
    false,
    String,
    'WiFi Network',
    'Configure the SSID of the ship WiFi. Influences notification checking behavior.',
  );
  static OVERRIDE_WIFI_CHECK = new AppSettings(
    'OVERRIDE_WIFI_CHECK',
    false,
    Boolean,
    'Override WiFi Check',
    "Attempt server connection even if you're not on configured WiFi network. Requires app restart. May consume more battery.",
  );
  static WS_HEALTHCHECK_DATE = new AppSettings('WS_HEALTHCHECK_DATE');
  static WS_OPEN_DATE = new AppSettings('WS_OPEN_DATE');
  static ENABLE_BACKGROUND_NOTIFICATIONS = new AppSettings(
    'ENABLE_BACKGROUND_NOTIFICATIONS',
    false,
    Boolean,
    'Enable Background Notifications',
    'Allow this app to listen for server notifications even when the app is closed',
  );

  constructor(
    key: string,
    isSecure: boolean = false,
    dataType: any = String,
    title: string = '',
    description: string = '',
  ) {
    this.key = key;
    this.isSecure = isSecure;
    this.dataType = dataType;
    this.title = title;
    this.description = description;
  }

  async getValue() {
    if (this.isSecure) {
      return await EncryptedStorage.getItem(this.key);
    }
    return await AsyncStorage.getItem(this.key);
  }

  async setValue(newValue: string) {
    console.log('SAVING SETTING', this.key, newValue);
    if (this.isSecure) {
      return await EncryptedStorage.setItem(this.key, newValue);
    }
    return await AsyncStorage.setItem(this.key, newValue);
  }

  async remove() {
    if (this.isSecure) {
      return await EncryptedStorage.removeItem(this.key);
    }
    return await AsyncStorage.removeItem(this.key);
  }
}

// @TODO deprecate this.
export async function initialSettings() {
  console.log('Doing initial settings');
  try {
    await AsyncStorage.setItem('URL_PREFIX', '/api/v3');
    let setting = await AsyncStorage.getItem('SERVER_URL');
    if (setting === null && Config.SERVER_URL !== undefined) {
      await AsyncStorage.setItem('SERVER_URL', Config.SERVER_URL);
    } else {
      console.log('Server URL is already set');
    }
    let wifi = await AppSettings.SHIP_SSID.getValue();
    if (wifi === null && Config.SHIP_SSID !== undefined) {
      await AppSettings.SHIP_SSID.setValue(Config.SHIP_SSID);
    } else {
      console.log('Ship WiFi is already set');
    }
  } catch (e) {
    console.error(e);
  }
  console.log('Server URL is:', await AsyncStorage.getItem('SERVER_URL'));
}
