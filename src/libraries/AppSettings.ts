// https://www.sohamkamani.com/javascript/enums/
// https://12factor.net/config
// https://medium.com/differential/managing-configuration-in-react-native-cd2dfb5e6f7b
// https://github.com/luggit/react-native-config

import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';
import EncryptedStorage from 'react-native-encrypted-storage';

export class AppSettings {
  key: string;
  isSecure: boolean;
  dataType: any;
  title: string;
  description: string;

  // @TODO make these consistent
  static SERVER_URL = new AppSettings('SERVER_URL', false, String, 'Server URL', 'URL of the Twitarr server.');
  static USERNAME = new AppSettings('username');
  static URL_PREFIX = new AppSettings('URL_PREFIX');
  static AUTH_TOKEN = new AppSettings('token', true);
  static SHIP_SSID = new AppSettings('SHIP_SSID');

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
const SettingKeys = Object.freeze({
  SERVER_URL: 'SERVER_URL',
});

// @TODO deprecate this.
export async function initialSettings() {
  console.log('Doing initial settings');
  try {
    await AsyncStorage.setItem('URL_PREFIX', '/api/v3');
    let setting = await AsyncStorage.getItem(SettingKeys.SERVER_URL);
    if (setting === null && Config.SERVER_URL !== undefined) {
      await AsyncStorage.setItem(SettingKeys.SERVER_URL, Config.SERVER_URL);
    } else {
      console.log('Server URL is already set');
    }
  } catch (e) {
    console.error(e);
  }
  console.log('Server URL is:', await AsyncStorage.getItem(SettingKeys.SERVER_URL));
}

// export interface Setting {
//   key: string;
//   secure: boolean;
// }
//
//
//
// export class Settings {
//   // static SERVER_URL: string = new Setting();
//   // key: string;
//   // value: string;
//   // get(key: string) {
//   //   console.log('Getting setting', key);
//   // }
//   // constructor(setting: Setting) {
//   //   this.key = key;
//   //   this.value = value;
//   //   // this.secure = secure;
//   // }
// }
