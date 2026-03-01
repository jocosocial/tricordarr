/**
 * CallKitService - Wrapper for react-native-callkeep to integrate with iOS CallKit
 *
 * This service enables native iOS calling UI for KrakenTalk voice calls.
 * CallKit shows the native incoming call screen, handles call actions from the lock screen,
 * and logs calls to the Phone app's Recents.
 *
 * Note: This only works on iOS. Android uses the existing notification-based approach.
 */

import {Platform} from 'react-native';
import RNCallKeep from 'react-native-callkeep';

// CallKeep configuration options
const CALLKEEP_OPTIONS = {
  ios: {
    appName: 'Tricordarr',
    supportsVideo: false,
    maximumCallsPerCallGroup: '1',
    maximumCallGroups: '1',
    includesCallsInRecents: true,
  },
  android: {
    alertTitle: 'Permissions required',
    alertDescription: 'This application needs to access your phone accounts',
    cancelButton: 'Cancel',
    okButton: 'OK',
    additionalPermissions: [] as string[],
    selfManaged: true,
  },
};

// End call reasons for reportEndCallWithUUID
export enum CallEndReason {
  Failed = 1,
  RemoteEnded = 2,
  Unanswered = 3,
  AnsweredElsewhere = 4,
  DeclinedElsewhere = 5,
  Missed = 6,
}

// Event handler types
type AnswerCallHandler = (callUUID: string) => void;
type EndCallHandler = (callUUID: string) => void;
type MuteCallHandler = (muted: boolean, callUUID: string) => void;
type AudioSessionActivatedHandler = () => void;

// Event handlers to be set by CallProvider
let onAnswerCallHandler: AnswerCallHandler | null = null;
let onEndCallHandler: EndCallHandler | null = null;
let onMuteCallHandler: MuteCallHandler | null = null;
let onAudioSessionActivatedHandler: AudioSessionActivatedHandler | null = null;

class CallKitServiceClass {
  private initialized = false;
  private setupPromise: Promise<void> | null = null;

  /**
   * Check if CallKit is available (iOS only)
   */
  isAvailable(): boolean {
    return Platform.OS === 'ios';
  }

  /**
   * Initialize CallKeep with configuration
   * Should be called early in app lifecycle
   */
  async setup(): Promise<void> {
    if (!this.isAvailable()) {
      console.log('[CallKitService] CallKit not available on this platform');
      return;
    }

    if (this.initialized) {
      console.log('[CallKitService] Already initialized');
      return;
    }

    // Prevent multiple simultaneous setup calls
    if (this.setupPromise) {
      return this.setupPromise;
    }

    this.setupPromise = this.performSetup();
    return this.setupPromise;
  }

  private async performSetup(): Promise<void> {
    try {
      await RNCallKeep.setup(CALLKEEP_OPTIONS);
      this.registerEventListeners();
      this.initialized = true;
      console.log('[CallKitService] Setup complete');
    } catch (error) {
      console.error('[CallKitService] Setup failed:', error);
      throw error;
    } finally {
      this.setupPromise = null;
    }
  }

  /**
   * Register listeners for CallKit events
   */
  private registerEventListeners(): void {
    // User answered call via CallKit UI
    RNCallKeep.addEventListener('answerCall', ({callUUID}) => {
      console.log('[CallKitService] answerCall event:', callUUID);
      onAnswerCallHandler?.(callUUID);
    });

    // User ended call via CallKit UI
    RNCallKeep.addEventListener('endCall', ({callUUID}) => {
      console.log('[CallKitService] endCall event:', callUUID);
      onEndCallHandler?.(callUUID);
    });

    // User toggled mute via CallKit UI
    RNCallKeep.addEventListener('didPerformSetMutedCallAction', ({muted, callUUID}) => {
      console.log('[CallKitService] didPerformSetMutedCallAction:', muted, callUUID);
      onMuteCallHandler?.(muted, callUUID);
    });

    // CallKit has activated the audio session - safe to start audio
    RNCallKeep.addEventListener('didActivateAudioSession', () => {
      console.log('[CallKitService] Audio session activated by CallKit');
      onAudioSessionActivatedHandler?.();
    });

    // CallKit has deactivated the audio session
    RNCallKeep.addEventListener('didDeactivateAudioSession', () => {
      console.log('[CallKitService] Audio session deactivated by CallKit');
    });

    // Call state changed - for debugging
    RNCallKeep.addEventListener('didDisplayIncomingCall', ({callUUID, handle, localizedCallerName}) => {
      console.log('[CallKitService] didDisplayIncomingCall:', callUUID, handle, localizedCallerName);
    });

    // Provider reset - can happen if system terminates the provider
    RNCallKeep.addEventListener('checkReachability', () => {
      console.log('[CallKitService] checkReachability event');
    });

    // Start action received from system
    RNCallKeep.addEventListener('didReceiveStartCallAction', ({callUUID, handle, name}) => {
      console.log('[CallKitService] didReceiveStartCallAction:', callUUID, handle, name);
    });

    // Call load with calls - for debugging restart scenarios
    RNCallKeep.addEventListener('didLoadWithEvents', events => {
      console.log('[CallKitService] didLoadWithEvents:', events);
    });
  }

  /**
   * Set event handlers for CallKit actions
   * Should be called by CallProvider to connect CallKit events to app state
   */
  setEventHandlers(handlers: {
    onAnswerCall?: AnswerCallHandler;
    onEndCall?: EndCallHandler;
    onMuteCall?: MuteCallHandler;
    onAudioSessionActivated?: AudioSessionActivatedHandler;
  }): void {
    onAnswerCallHandler = handlers.onAnswerCall ?? null;
    onEndCallHandler = handlers.onEndCall ?? null;
    onMuteCallHandler = handlers.onMuteCall ?? null;
    onAudioSessionActivatedHandler = handlers.onAudioSessionActivated ?? null;
  }

  /**
   * Clear all event handlers
   */
  clearEventHandlers(): void {
    onAnswerCallHandler = null;
    onEndCallHandler = null;
    onMuteCallHandler = null;
    onAudioSessionActivatedHandler = null;
  }

  /**
   * Display incoming call via native CallKit UI
   * This shows the full-screen incoming call interface on iOS
   *
   * @param callUUID - Unique identifier for the call (should match app's callID)
   * @param callerName - Display name of the caller
   * @param handle - Unique handle for the caller (e.g., userID)
   */
  async displayIncomingCall(callUUID: string, callerName: string, handle: string): Promise<void> {
    if (!this.isAvailable()) return;

    // Ensure setup has completed before displaying incoming call
    if (!this.initialized) {
      console.log('[CallKitService] displayIncomingCall: Setup not complete, waiting...');
      await this.setup();
    }

    console.log('[CallKitService] Displaying incoming call:', callUUID, callerName);
    RNCallKeep.displayIncomingCall(
      callUUID,
      handle,
      callerName,
      'generic', // handleType: 'generic' | 'number' | 'email'
      false, // hasVideo
    );
  }

  /**
   * Start an outgoing call via CallKit
   * This shows the calling UI and registers the call with the system
   *
   * IMPORTANT: After calling startCall(), CallKit fires didReceiveStartCallAction
   * and expects us to call setCurrentCallActive() quickly. If we don't, CallKit
   * will automatically end the call. We call setCurrentCallActive immediately
   * to prevent this auto-end behavior.
   *
   * @param callUUID - Unique identifier for the call
   * @param calleeName - Display name of the person being called
   * @param handle - Unique handle for the callee (e.g., userID)
   */
  async startOutgoingCall(callUUID: string, calleeName: string, handle: string): Promise<void> {
    if (!this.isAvailable()) {
      console.log('[CallKitService] startOutgoingCall: Not available (not iOS)');
      return;
    }

    // Ensure setup has completed before starting call
    if (!this.initialized) {
      console.log('[CallKitService] startOutgoingCall: Setup not complete, waiting...');
      await this.setup();
    }

    console.log(
      '[CallKitService] Starting outgoing call:',
      callUUID,
      calleeName,
      'handle:',
      handle,
      'initialized:',
      this.initialized,
    );
    try {
      RNCallKeep.startCall(callUUID, handle, calleeName, 'generic', false);
      console.log('[CallKitService] startCall succeeded');

      // Immediately mark the call as active to prevent CallKit from auto-ending
      // This acknowledges the didReceiveStartCallAction that CallKit will fire
      RNCallKeep.setCurrentCallActive(callUUID);
      console.log('[CallKitService] setCurrentCallActive called to prevent auto-end');
    } catch (error) {
      console.error('[CallKitService] startCall failed:', error);
    }
  }

  /**
   * Report that a call has connected (either incoming was answered or outgoing was accepted)
   * This updates the CallKit UI to show the connected state with timer
   *
   * @param callUUID - The call that connected
   */
  reportCallConnected(callUUID: string): void {
    if (!this.isAvailable()) return;

    console.log('[CallKitService] Reporting call connected:', callUUID);
    RNCallKeep.setCurrentCallActive(callUUID);
  }

  /**
   * End a call and update CallKit
   * This dismisses the CallKit UI
   *
   * @param callUUID - The call to end
   */
  endCall(callUUID: string): void {
    if (!this.isAvailable()) return;

    console.log('[CallKitService] Ending call:', callUUID);
    RNCallKeep.endCall(callUUID);
  }

  /**
   * End all active calls
   */
  endAllCalls(): void {
    if (!this.isAvailable()) return;

    console.log('[CallKitService] Ending all calls');
    RNCallKeep.endAllCalls();
  }

  /**
   * Set mute state for a call
   * This syncs the mute button state in CallKit UI
   *
   * @param callUUID - The call to mute/unmute
   * @param muted - Whether the call should be muted
   */
  setMuted(callUUID: string, muted: boolean): void {
    if (!this.isAvailable()) return;

    console.log('[CallKitService] Setting muted:', muted, callUUID);
    RNCallKeep.setMutedCall(callUUID, muted);
  }

  /**
   * Report that a call ended with a specific reason
   * This is used for proper call logging in Recents
   *
   * @param callUUID - The call that ended
   * @param reason - The reason the call ended (see CallEndReason enum)
   */
  reportEndCallWithReason(callUUID: string, reason: CallEndReason): void {
    if (!this.isAvailable()) return;

    console.log('[CallKitService] Reporting call ended:', callUUID, 'reason:', reason);
    RNCallKeep.reportEndCallWithUUID(callUUID, reason);
  }

  /**
   * Update the caller info for an existing call
   * Can be used if caller name becomes available after initial display
   *
   * @param callUUID - The call to update
   * @param localizedCallerName - Updated caller name
   */
  updateDisplay(callUUID: string, localizedCallerName: string, handle: string): void {
    if (!this.isAvailable()) return;

    console.log('[CallKitService] Updating display:', callUUID, localizedCallerName);
    RNCallKeep.updateDisplay(callUUID, localizedCallerName, handle);
  }

  /**
   * Check if there are any active calls in CallKit
   */
  async hasActiveCall(): Promise<boolean> {
    if (!this.isAvailable()) return false;

    try {
      const calls = await RNCallKeep.getCalls();
      return Boolean(calls && calls.length > 0);
    } catch (error) {
      console.error('[CallKitService] Error checking active calls:', error);
      return false;
    }
  }
}

// Export singleton instance
export const CallKitService = new CallKitServiceClass();
