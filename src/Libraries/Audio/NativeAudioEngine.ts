import {NativeEventEmitter, NativeModules, Platform} from 'react-native';

const {AudioEngine} = NativeModules;

if (!AudioEngine) {
  console.error('[NativeAudioEngine] Native AudioEngine module not found');
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
   * Start the audio engine (microphone capture and playback)
   */
  async start(): Promise<void> {
    if (!AudioEngine) {
      throw new Error('AudioEngine native module not available');
    }

    try {
      await AudioEngine.start();
      console.log('[NativeAudioEngine] Started successfully');
    } catch (error) {
      console.error('[NativeAudioEngine] Failed to start:', error);
      throw error;
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
      console.log('[NativeAudioEngine] Stopped');
    } catch (error) {
      console.error('[NativeAudioEngine] Failed to stop:', error);
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
      console.log(`[NativeAudioEngine] Microphone ${muted ? 'muted' : 'unmuted'}`);
    } catch (error) {
      console.error('[NativeAudioEngine] Failed to set mute:', error);
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
      console.log(`[NativeAudioEngine] Speaker ${speakerOn ? 'on' : 'off'}`);
    } catch (error) {
      console.error('[NativeAudioEngine] Failed to set speaker:', error);
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
      console.error('[NativeAudioEngine] Failed to play audio:', error);
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

    if (listener && eventEmitter) {
      this.eventSubscription = eventEmitter.addListener('onAudioData', (event: AudioDataEvent) => {
        if (this.audioDataListener) {
          this.audioDataListener(event);
        }
      });
    } else if (listener && !eventEmitter) {
      console.warn('[NativeAudioEngine] Cannot set audio data listener - AudioEngine module not available');
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
