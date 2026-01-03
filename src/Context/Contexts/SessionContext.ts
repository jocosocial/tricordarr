import {createContext, useContext} from 'react';

import {TokenStringData} from '#src/Structs/ControllerStructs';
import {Session} from '#src/Structs/SessionStructs';

export interface SessionContextType {
  currentSession: Session | null;
  currentUserID: string | null; // Convenience: currentSession?.tokenData?.userID
  sessions: Session[];
  switchSession: (sessionID: string) => Promise<void>;
  createSession: (serverUrl: string, preRegistrationMode: boolean) => Promise<Session>;
  findOrCreateSession: (serverUrl: string, preRegistrationMode: boolean) => Promise<Session>;
  updateSession: (sessionID: string, updates: Partial<Session>) => Promise<void>;
  deleteSession: (sessionID: string) => Promise<void>;
  updateSessionToken: (sessionID: string, tokenData: TokenStringData | null) => Promise<void>;
  isLoading: boolean;
  isLoggedIn: boolean;
}

export const SessionContext = createContext<SessionContextType>({
  currentSession: null,
  currentUserID: null,
  sessions: [],
  switchSession: async () => {},
  createSession: async () => {
    throw new Error('SessionProvider not initialized');
  },
  findOrCreateSession: async () => {
    throw new Error('SessionProvider not initialized');
  },
  updateSession: async () => {},
  deleteSession: async () => {},
  updateSessionToken: async () => {},
  isLoading: true,
  isLoggedIn: false,
});

export const useSession = () => useContext(SessionContext);
