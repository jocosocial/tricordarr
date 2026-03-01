import {Platform} from 'react-native';
import DeviceInfo from 'react-native-device-info';

/**
 * Centralized platform detection. This came from Bluesky.
 * https://github.com/bluesky-social/social-app/blob/main/src/platform/detection.ts
 */

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isNative = isIOS || isAndroid;
export const isWeb = !isNative;

/** True when running in iOS Simulator or Android Emulator. Resolves to false on web. */
export const isEmulator = (): Promise<boolean> => {
  if (!isNative) return Promise.resolve(false);
  return DeviceInfo.isEmulator();
};
export const isMobileWebMediaQuery = 'only screen and (max-width: 1300px)';
export const isMobileWeb =
  isWeb &&
  // @ts-ignore we know window exists in web context
  global.window.matchMedia(isMobileWebMediaQuery)?.matches;
export const isIPhoneWeb =
  isWeb &&
  // @ts-ignore we know navigator exists in web context
  /iPhone/.test(global.navigator.userAgent);
