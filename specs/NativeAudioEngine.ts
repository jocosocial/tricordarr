import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
  /**
   * Begin call audio. On Android this also starts the microphone-typed foreground service that
   * keeps capture alive in the background and owns the in-call notification, which is why it
   * needs the call metadata. On iOS the metadata is unused; CallKit owns the call UI there.
   */
  start(callID: string, callerName: string, startTimeMs: number): Promise<boolean>;
  stop(): Promise<boolean>;
  setMuted(muted: boolean): Promise<boolean>;
  setSpeakerOn(speakerOn: boolean): Promise<boolean>;
  playAudio(audioData: number[]): void;
  /**
   * Show the ringing call notification. Android only: a ringing call has no microphone in use, so
   * it is a plain high-importance notification rather than a foreground service. A no-op on iOS,
   * where CallKit presents incoming calls.
   */
  showIncomingCall(callID: string, callerName: string, callerUserID: string): void;
  /** Dismiss any call notification currently showing. A no-op on iOS. */
  dismissCallNotification(): void;
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

export default TurboModuleRegistry.get<Spec>('AudioEngine');
