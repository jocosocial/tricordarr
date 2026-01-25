import {createContext, useContext} from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';

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

  // Actions
  initiateCall: (userHeader: UserHeader) => Promise<void>;
  receiveCall: (callID: string, callerUserHeader: UserHeader) => void;
  answerCall: (callID: string) => Promise<void>;
  declineCall: (callID: string) => Promise<void>;
  endCall: () => Promise<void>;
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
