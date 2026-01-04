import {TokenStringData} from '#src/Structs/ControllerStructs';
import {Session} from '#src/Structs/SessionStructs';

/**
 * Internal state structure for session management.
 * Inspired by Bluesky's session state management:
 * https://github.com/bluesky-social/social-app/blob/55806f10870128f7702714b5968c64a0e908281e/src/state/session/index.tsx
 */
export interface SessionState {
  sessions: Session[];
  currentSessionID: string | null;
  isLoading: boolean;
  needsPersist: boolean; // Flag to trigger persistence
}

/**
 * Action types for session state transitions.
 * Follows the reducer pattern from Bluesky's session management:
 * https://github.com/bluesky-social/social-app/blob/55806f10870128f7702714b5968c64a0e908281e/src/state/session/index.tsx
 */
export type SessionAction =
  | {
      type: 'loaded-sessions';
      sessions: Session[];
      lastSessionID: string | null;
    }
  | {
      type: 'switched-to-session';
      sessionID: string;
    }
  | {
      type: 'created-session';
      session: Session;
    }
  | {
      type: 'updated-session';
      sessionID: string;
      updates: Partial<Session>;
    }
  | {
      type: 'deleted-session';
      sessionID: string;
    }
  | {
      type: 'synced-from-storage';
      sessions: Session[];
      lastSessionID: string | null;
    };

/**
 * Get initial state for session store.
 */
export function getInitialState(sessions: Session[] = [], lastSessionID: string | null = null): SessionState {
  return {
    sessions,
    currentSessionID: lastSessionID,
    isLoading: false,
    needsPersist: false,
  };
}

/**
 * Pure reducer function for session state transitions.
 * All state changes go through this function to ensure atomicity.
 * Based on Bluesky's reducer pattern:
 * https://github.com/bluesky-social/social-app/blob/55806f10870128f7702714b5968c64a0e908281e/src/state/session/index.tsx
 */
export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'loaded-sessions': {
      return {
        sessions: action.sessions,
        currentSessionID: action.lastSessionID,
        isLoading: false,
        needsPersist: false, // Initial load doesn't need persistence
      };
    }

    case 'switched-to-session': {
      const session = state.sessions.find(s => s.sessionID === action.sessionID);
      if (!session) {
        console.warn('[sessionReducer] Attempted to switch to non-existent session:', action.sessionID);
        return state;
      }

      // Update lastUsedAt for the session being switched to
      const updatedSession: Session = {
        ...session,
        lastUsedAt: new Date().toISOString(),
      };

      return {
        ...state,
        sessions: state.sessions.map(s => (s.sessionID === action.sessionID ? updatedSession : s)),
        currentSessionID: action.sessionID,
        needsPersist: true,
      };
    }

    case 'created-session': {
      // Check if session already exists
      const existingIndex = state.sessions.findIndex(s => s.sessionID === action.session.sessionID);
      if (existingIndex >= 0) {
        // Update existing session
        return {
          ...state,
          sessions: state.sessions.map((s, i) => (i === existingIndex ? action.session : s)),
          currentSessionID: action.session.sessionID,
          needsPersist: true,
        };
      }

      // Add new session
      return {
        ...state,
        sessions: [...state.sessions, action.session],
        currentSessionID: action.session.sessionID,
        needsPersist: true,
      };
    }

    case 'updated-session': {
      const sessionIndex = state.sessions.findIndex(s => s.sessionID === action.sessionID);
      if (sessionIndex < 0) {
        console.warn('[sessionReducer] Attempted to update non-existent session:', action.sessionID);
        return state;
      }

      const updatedSession: Session = {
        ...state.sessions[sessionIndex],
        ...action.updates,
        lastUsedAt: new Date().toISOString(),
      };

      return {
        ...state,
        sessions: state.sessions.map(s => (s.sessionID === action.sessionID ? updatedSession : s)),
        needsPersist: true,
      };
    }

    case 'deleted-session': {
      const filteredSessions = state.sessions.filter(s => s.sessionID !== action.sessionID);
      const newCurrentSessionID =
        state.currentSessionID === action.sessionID ? (filteredSessions.length > 0 ? filteredSessions[0].sessionID : null) : state.currentSessionID;

      return {
        ...state,
        sessions: filteredSessions,
        currentSessionID: newCurrentSessionID,
        needsPersist: true,
      };
    }

    case 'synced-from-storage': {
      // Sync state from external storage (e.g., multi-tab scenarios)
      // Find the current session in the synced sessions
      const currentSession = state.currentSessionID
        ? action.sessions.find(s => s.sessionID === state.currentSessionID)
        : null;

      return {
        sessions: action.sessions,
        currentSessionID: currentSession ? state.currentSessionID : action.lastSessionID,
        isLoading: false,
        needsPersist: false, // Already persisted externally
      };
    }

    default: {
      // TypeScript exhaustiveness check
      const _exhaustive: never = action;
      return state;
    }
  }
}

