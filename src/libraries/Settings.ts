// https://www.sohamkamani.com/javascript/enums/
// https://12factor.net/config
// https://medium.com/differential/managing-configuration-in-react-native-cd2dfb5e6f7b
// https://github.com/luggit/react-native-config

import AsyncStorage from "@react-native-async-storage/async-storage";
import Config from 'react-native-config';

export const PrivateSettings = Object.freeze({
  SERVER_URL: Symbol('SERVER_URL'),
  LOG_LEVEL: Symbol('LOG_LEVEL'),
});

export class Settings {
  // key: string;
  static SERVER_URL = new Settings('SERVER_URL', false, String);
  static LOG_LEVEL = new Settings('LOG_LEVEL', false, String);

  constructor(key: string, isSecure: boolean, type: any = String) {
    // this.key = key;
    console.log('New Key:', key);
    console.log('Secure?', isSecure);
    console.log('Type?', type);
  }

  // getSetting()
}

const SettingKeys = Object.freeze({
  SERVER_URL: 'SERVER_URL',
});

export async function initialSettings() {
  console.log('Doing initial settings');
  try {
    let setting = await AsyncStorage.getItem(SettingKeys.SERVER_URL);
    if (setting === null && Config.SERVER_URL !== undefined) {
      await AsyncStorage.setItem(SettingKeys.SERVER_URL, Config.SERVER_URL);
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
