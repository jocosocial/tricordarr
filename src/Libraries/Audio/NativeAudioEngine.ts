import {NativeEventEmitter, Platform} from 'react-native';

import {createLogger} from '#src/Libraries/Logger';

import type {Spec} from '#specs/NativeAudioEngine';
import NativeAudioEngineModule from '#specs/NativeAudioEngine';

const logger = createLogger('NativeAudioEngine');

const AudioEngine: Spec | null = NativeAudioEngineModule;

if (!AudioEngine) {
  logger.error('Native AudioEngine module not found');
}

// Only create event emitter if AudioEngine is available
// NativeEventEmitter requires a non-null native module
const eventEmitter = AudioEngine ? new NativeEventEmitter(AudioEngine) : null;

export interface AudioDataEvent {
  samples: number[];
}

export type AudioDataListener = (event: AudioDataEvent) => void;

/**
 * Native audio engine wrapper for React Native.
 * Handles microphone capture and audio playback at 16kHz, 16-bit PCM mono.
 */
export class NativeAudioEngine {
  private audioDataListener: AudioDataListener | null = null;
  private eventSubscription: any = null;

  /**
   * Start the audio engine (microphone capture and playback).
   *
   * On Android this starts the call's foreground service, which is what permits microphone
   * capture while backgrounded and owns the in-call notification -- hence the call metadata.
   * On iOS the metadata is ignored because CallKit owns the call identity.
   *
   * @param callID Server-issued call identifier.
   * @param callerName Display name shown in the Android in-call notification.
   * @param startTimeMs Epoch milliseconds the call connected, used for the notification timer.
   */
  async start(callID: string, callerName: string, startTimeMs: number): Promise<void> {
    if (!AudioEngine) {
      throw new Error('AudioEngine native module not available');
    }

    try {
      await AudioEngine.start(callID, callerName, startTimeMs);
      logger.info('Started successfully');
    } catch (error) {
      logger.error('Failed to start', error);
      throw error;
    }
  }

  /**
   * Show the ringing call notification. Android only; a no-op on iOS, where CallKit presents
   * incoming calls.
   */
  static showIncomingCall(callID: string, callerName: string, callerUserID: string): void {
    if (!AudioEngine) {
      return;
    }

    try {
      AudioEngine.showIncomingCall(callID, callerName, callerUserID);
    } catch (error) {
      logger.error('Failed to show incoming call notification', error);
    }
  }

  /**
   * Dismiss whichever call notification is currently showing. Android only; a no-op on iOS.
   * Safe to call when nothing is showing.
   */
  static dismissCallNotification(): void {
    if (!AudioEngine) {
      return;
    }

    try {
      AudioEngine.dismissCallNotification();
    } catch (error) {
      logger.error('Failed to dismiss call notification', error);
    }
  }

  /**
   * Stop the audio engine
   */
  async stop(): Promise<void> {
    if (!AudioEngine) {
      return;
    }

    try {
      await AudioEngine.stop();
      logger.info('Stopped');
    } catch (error) {
      logger.error('Failed to stop', error);
      throw error;
    }
  }

  /**
   * Mute or unmute the microphone
   * @param muted true to mute, false to unmute
   */
  async setMuted(muted: boolean): Promise<void> {
    if (!AudioEngine) {
      return;
    }

    try {
      await AudioEngine.setMuted(muted);
      logger.info(`Microphone ${muted ? 'muted' : 'unmuted'}`);
    } catch (error) {
      logger.error('Failed to set mute', error);
      throw error;
    }
  }

  /**
   * Toggle speaker on/off (earpiece vs speakerphone)
   * @param speakerOn true for speaker, false for earpiece
   */
  async setSpeakerOn(speakerOn: boolean): Promise<void> {
    if (!AudioEngine) {
      return;
    }

    try {
      await AudioEngine.setSpeakerOn(speakerOn);
      logger.info(`Speaker ${speakerOn ? 'on' : 'off'}`);
    } catch (error) {
      logger.error('Failed to set speaker', error);
      throw error;
    }
  }

  /**
   * Play received audio samples through the speaker
   * @param samples Int16 array of audio samples
   */
  playAudio(samples: number[]): void {
    if (!AudioEngine) {
      return;
    }

    try {
      AudioEngine.playAudio(samples);
    } catch (error) {
      logger.error('Failed to play audio', error);
    }
  }

  /**
   * Set listener for audio data captured from microphone
   * @param listener Callback that receives audio samples
   */
  setAudioDataListener(listener: AudioDataListener): void {
    // Remove existing listener
    if (this.eventSubscription) {
      this.eventSubscription.remove();
    }

    this.audioDataListener = listener;

    if (eventEmitter) {
      this.eventSubscription = eventEmitter.addListener('onAudioData', (event: AudioDataEvent) => {
        if (this.audioDataListener) {
          this.audioDataListener(event);
        }
      });
    } else {
      logger.warn('Cannot set audio data listener - AudioEngine module not available');
    }
  }

  /**
   * Remove audio data listener
   */
  removeAudioDataListener(): void {
    if (this.eventSubscription) {
      this.eventSubscription.remove();
      this.eventSubscription = null;
    }
    this.audioDataListener = null;
  }

  /**
   * Check if AudioEngine native module is available
   */
  static isAvailable(): boolean {
    return !!AudioEngine;
  }

  /**
   * Get platform-specific information
   */
  static getPlatformInfo(): {platform: string; hasNativeModule: boolean} {
    return {
      platform: Platform.OS,
      hasNativeModule: NativeAudioEngine.isAvailable(),
    };
  }
}
