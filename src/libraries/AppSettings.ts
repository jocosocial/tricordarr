// https://www.sohamkamani.com/javascript/enums/
// https://12factor.net/config
// https://medium.com/differential/managing-configuration-in-react-native-cd2dfb5e6f7b
// https://github.com/luggit/react-native-config

import AsyncStorage from '@react-native-async-storage/async-storage';
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
  static TOKEN_STRING_DATA = new AppSettings(StorageKeys.TOKEN_STRING_DATA, true);
  static OVERRIDE_WIFI_CHECK = new AppSettings(
    'OVERRIDE_WIFI_CHECK',
    false,
    Boolean,
    'Override WiFi Check',
    "Attempt server connection even if you're not on configured WiFi network. Requires app restart. May consume more battery.",
  );
  static WS_HEALTHCHECK_DATE = new AppSettings('WS_HEALTHCHECK_DATE');
  static WS_OPEN_DATE = new AppSettings('WS_OPEN_DATE');

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
