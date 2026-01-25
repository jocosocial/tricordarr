import {CallData, CallState} from '#src/Context/Contexts/CallContext';
import {UserHeader} from '#src/Structs/ControllerStructs';

export enum CallActions {
  INITIATE = 'INITIATE',
  RECEIVE = 'RECEIVE',
  ANSWER = 'ANSWER',
  DECLINE = 'DECLINE',
  CONNECT = 'CONNECT',
  END = 'END',
  UPDATE_DURATION = 'UPDATE_DURATION',
  TOGGLE_MUTE = 'TOGGLE_MUTE',
  TOGGLE_SPEAKER = 'TOGGLE_SPEAKER',
  SET_SOCKET = 'SET_SOCKET',
}

export type CallActionType =
  | {type: CallActions.INITIATE; payload: {callID: string; remoteUser: UserHeader}}
  | {type: CallActions.RECEIVE; payload: {callID: string; remoteUser: UserHeader}}
  | {type: CallActions.ANSWER; payload: {callID: string}}
  | {type: CallActions.DECLINE}
  | {type: CallActions.CONNECT}
  | {type: CallActions.END}
  | {type: CallActions.UPDATE_DURATION; payload: number}
  | {type: CallActions.TOGGLE_MUTE}
  | {type: CallActions.TOGGLE_SPEAKER}
  | {type: CallActions.SET_SOCKET; payload: any};

export interface CallStateType {
  currentCall: CallData | null;
  state: CallState;
  isMuted: boolean;
  isSpeakerOn: boolean;
  duration: number;
}

export const initialCallState: CallStateType = {
  currentCall: null,
  state: CallState.IDLE,
  isMuted: false,
  isSpeakerOn: false,
  duration: 0,
};

export const callReducer = (state: CallStateType, action: CallActionType): CallStateType => {
  switch (action.type) {
    case CallActions.INITIATE:
      return {
        ...state,
        currentCall: {
          callID: action.payload.callID,
          remoteUser: action.payload.remoteUser,
          isIncoming: false,
          startTime: null,
          phoneSocket: null,
        },
        state: CallState.INITIATING,
        duration: 0,
      };

    case CallActions.RECEIVE:
      return {
        ...state,
        currentCall: {
          callID: action.payload.callID,
          remoteUser: action.payload.remoteUser,
          isIncoming: true,
          startTime: null,
          phoneSocket: null,
        },
        state: CallState.RINGING,
        duration: 0,
      };

    case CallActions.ANSWER:
      return {
        ...state,
        state: CallState.CONNECTING,
      };

    case CallActions.CONNECT:
      return {
        ...state,
        state: CallState.ACTIVE,
        currentCall: state.currentCall
          ? {
              ...state.currentCall,
              startTime: new Date(),
            }
          : null,
      };

    case CallActions.DECLINE:
    case CallActions.END:
      return {
        ...initialCallState,
        state: CallState.ENDED,
      };

    case CallActions.UPDATE_DURATION:
      return {
        ...state,
        duration: action.payload,
      };

    case CallActions.TOGGLE_MUTE:
      return {
        ...state,
        isMuted: !state.isMuted,
      };

    case CallActions.TOGGLE_SPEAKER:
      return {
        ...state,
        isSpeakerOn: !state.isSpeakerOn,
      };

    case CallActions.SET_SOCKET:
      return {
        ...state,
        currentCall: state.currentCall
          ? {
              ...state.currentCall,
              phoneSocket: action.payload,
            }
          : null,
      };

    default:
      return state;
  }
};
