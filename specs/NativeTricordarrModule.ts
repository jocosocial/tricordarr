import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
  blurTextInImage(inputFilePath: string, callback: (newPath: string) => void): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>(
  'NativeTricordarrModule',
);
