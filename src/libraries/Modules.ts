/**
 * Interface that matches the native code signature.
 * ImageTextBlur.kt
 */
interface ImageTextBlurModuleType {
  blurTextInImage: (inputFilePath: string, callback: Function) => void;
}

/**
 * https://stackoverflow.com/questions/62450379/react-native-extend-nativemodules-typescript-types
 */
declare module 'react-native' {
  interface NativeModulesStatic {
    ImageTextBlurModule: ImageTextBlurModuleType;
  }
}
