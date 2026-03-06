import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
  start(): Promise<boolean>;
  stop(): Promise<boolean>;
  setMuted(muted: boolean): Promise<boolean>;
  setSpeakerOn(speakerOn: boolean): Promise<boolean>;
  playAudio(audioData: number[]): void;
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

export default TurboModuleRegistry.get<Spec>('AudioEngine');
