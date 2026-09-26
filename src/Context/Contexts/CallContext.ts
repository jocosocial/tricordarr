import {createContext, useContext} from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';

import {CallEndReason} from '#src/Libraries/Call/CallKitService';
import {UserHeader} from '#src/Structs/ControllerStructs';

export enum CallState {
  IDLE = 'idle',
  INITIATING = 'initiating',
  RINGING = 'ringing',
  CONNECTING = 'connecting',
  ACTIVE = 'active',
  ENDING = 'ending',
  ENDED = 'ended',
}

export interface CallData {
  callID: string;
  remoteUser: UserHeader;
  isIncoming: boolean;
  startTime: Date | null;
  phoneSocket: ReconnectingWebSocket | null;
}

export interface CallContextType {
  // State
  currentCall: CallData | null;
  callState: CallState;
  isMuted: boolean;
  isSpeakerOn: boolean;
  callDuration: number;
  /** True while a mute change is being applied to the native audio engine. */
  isMutePending: boolean;
  /** True while an audio-route change is being applied to the native audio engine. */
  isSpeakerPending: boolean;

  // Actions
  initiateCall: (userHeader: UserHeader) => Promise<void>;
  receiveCall: (callID: string, callerUserHeader: UserHeader, options?: {useCallKit?: boolean}) => void;
  answerCall: (callID: string) => Promise<void>;
  declineCall: (callID: string) => Promise<void>;
  endCall: () => Promise<void>;
  /**
   * Tear down local call state without notifying the server, for when the server has told us the
   * call is already resolved (answered on another device, or ended). Does not POST a decline.
   * Ignores events for a call this device is not on, and ignores an "answered" event for the call
   * this device itself answered.
   */
  dismissCallLocally: (callID: string, reason: CallEndReason) => Promise<void>;
  toggleMute: () => void;
  toggleSpeaker: () => void;
}

export const CallContext = createContext<CallContextType | undefined>(undefined);

export const useCall = () => {
  const context = useContext(CallContext);
  if (context === undefined) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};
