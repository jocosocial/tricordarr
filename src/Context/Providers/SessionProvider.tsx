import React, {PropsWithChildren, useCallback, useEffect, useMemo, useRef, useSyncExternalStore} from 'react';
import {v4 as uuidv4} from 'uuid';

import {SessionContext, SessionContextType} from '#src/Context/Contexts/SessionContext';
import {SessionStore} from '#src/Context/State/SessionStore';
import {useOneTaskAtATime} from '#src/Hooks/useOneTaskAtATime';
import {createLogger} from '#src/Libraries/Logger';
import {SessionStorage} from '#src/Libraries/Storage/SessionStorage';
import {TokenStringData} from '#src/Structs/ControllerStructs';
import {Session} from '#src/Structs/SessionStructs';

const logger = createLogger('SessionProvider.tsx');

/**
 * SessionProvider refactored to use reducer pattern and useSyncExternalStore
 * for synchronous state access, eliminating race conditions.
 *
 * Architecture based on Bluesky's session management:
 * https://github.com/bluesky-social/social-app/blob/55806f10870128f7702714b5968c64a0e908281e/src/state/session/index.tsx
 */
export const SessionProvider = ({children}: PropsWithChildren) => {
  // Create store instance (persists across renders)
  // Based on Bluesky's SessionStore pattern
  const storeRef = useRef<SessionStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = new SessionStore();
  }
  const store = storeRef.current;

  // Subscribe to store changes using useSyncExternalStore for synchronous state access
  // This ensures components always get the latest state without race conditions
  // See: https://github.com/bluesky-social/social-app/blob/55806f10870128f7702714b5968c64a0e908281e/src/state/session/index.tsx
  const state = useSyncExternalStore(
    store.subscribe.bind(store),
    store.getState.bind(store),
    store.getState.bind(store), // Server snapshot (same as client for React Native)
  );

  // Separate cancellation hooks for load and persist to prevent them from aborting each other
  // Based on Bluesky's useOneTaskAtATime pattern
  const cancelLoadTask = useOneTaskAtATime();
  const cancelPersistTask = useOneTaskAtATime();

  // Load initial state from storage on mount
  useEffect(() => {
    const loadSessions = async () => {
      const signal = cancelLoadTask();
      try {
        const loadedSessions = await SessionStorage.getAll();
        if (signal.aborted) return;

        const lastSessionID = await SessionStorage.getLastSessionID();
        if (signal.aborted) return;

        // Dispatch loaded-sessions action
        store.dispatch({
          type: 'loaded-sessions',
          sessions: loadedSessions,
          lastSessionID,
        });
      } catch (error) {
        logger.error('Error loading sessions:', error);
        // Still dispatch with empty state to mark as loaded
        if (!signal.aborted) {
          store.dispatch({
            type: 'loaded-sessions',
            sessions: [],
            lastSessionID: null,
          });
        }
      }
    };

    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Handle persistence when needsPersist flag is set
  useEffect(() => {
    if (!state.needsPersist) {
      return;
    }

    const persistState = async () => {
      const signal = cancelPersistTask();

      try {
        // Persist all sessions atomically
        if (signal.aborted) return;
        await SessionStorage.saveAll(state.sessions);

        // Persist last session ID if current session exists
        if (state.currentSessionID) {
          if (signal.aborted) return;
          await SessionStorage.setLastSessionID(state.currentSessionID);
        } else {
          if (signal.aborted) return;
          await SessionStorage.setLastSessionID('');
        }

        if (!signal.aborted) {
          store.dispatch({type: 'persisted'});
        }
      } catch (error) {
        logger.error('Error persisting sessions:', error);
      }
    };

    persistState();
  }, [state.needsPersist, state.sessions, state.currentSessionID, store, cancelPersistTask]);

  // Computed values from state
  const currentSession = useMemo(() => {
    if (!state.currentSessionID) {
      return null;
    }
    return state.sessions.find(s => s.sessionID === state.currentSessionID) || null;
  }, [state.sessions, state.currentSessionID]);

  const currentUserID = useMemo(() => {
    return currentSession?.tokenData?.userID || null;
  }, [currentSession]);

  const isLoggedIn = useMemo(() => {
    return !!currentSession?.tokenData;
  }, [currentSession]);

  // Session operations - all dispatch actions synchronously
  const switchSession = useCallback(
    async (sessionID: string) => {
      const session = state.sessions.find(s => s.sessionID === sessionID);
      if (!session) {
        logger.warn('Attempted to switch to non-existent session:', sessionID);
        return;
      }

      // Dispatch action synchronously - persistence happens in useEffect
      store.dispatch({
        type: 'switched-to-session',
        sessionID,
      });
    },
    [state.sessions, store],
  );

  const createSession = useCallback(
    async (serverUrl: string, preRegistrationMode: boolean): Promise<Session> => {
      const now = new Date().toISOString();
      const newSession: Session = {
        sessionID: uuidv4(),
        serverUrl,
        preRegistrationMode,
        tokenData: null,
        createdAt: now,
        lastUsedAt: now,
      };

      // Dispatch action synchronously - persistence happens in useEffect
      store.dispatch({
        type: 'created-session',
        session: newSession,
      });

      return newSession;
    },
    [store],
  );

  const findOrCreateSession = useCallback(
    async (serverUrl: string, preRegistrationMode: boolean): Promise<Session> => {
      // Try to find existing session matching criteria
      const existing = state.sessions.find(
        s => s.serverUrl === serverUrl && s.preRegistrationMode === preRegistrationMode,
      );

      if (existing) {
        // Switch to existing session
        await switchSession(existing.sessionID);
        return existing;
      }

      // Create new session
      return await createSession(serverUrl, preRegistrationMode);
    },
    [state.sessions, switchSession, createSession],
  );

  const updateSessionToken = useCallback(
    async (sessionID: string, tokenData: TokenStringData | null) => {
      const currentState = store.getState();
      const session = currentState.sessions.find(s => s.sessionID === sessionID);
      if (!session) {
        logger.warn('Attempted to update token for non-existent session:', sessionID);
        return;
      }

      store.dispatch({
        type: 'updated-session',
        sessionID,
        updates: {tokenData},
      });
    },
    [store],
  );

  const signIn = useCallback(
    async (tokenData: TokenStringData) => {
      if (!currentSession) {
        logger.error('Cannot sign in: no current session');
        return;
      }
      await updateSessionToken(currentSession.sessionID, tokenData);
    },
    [currentSession, updateSessionToken],
  );

  const signOut = useCallback(async () => {
    if (!currentSession) {
      logger.error('Cannot sign out: no current session');
      return;
    }
    await updateSessionToken(currentSession.sessionID, null);
  }, [currentSession, updateSessionToken]);

  const updateSession = useCallback(
    async (sessionID: string, updates: Partial<Session>) => {
      const currentState = store.getState();
      const session = currentState.sessions.find(s => s.sessionID === sessionID);
      if (!session) {
        logger.warn('Attempted to update non-existent session:', sessionID);
        return;
      }

      // If server URL is changing and this is the current session, clear token directly
      if (updates.serverUrl !== undefined && updates.serverUrl !== session.serverUrl) {
        if (sessionID === currentState.currentSessionID && session.tokenData) {
          store.dispatch({
            type: 'updated-session',
            sessionID,
            updates: {tokenData: null},
          });
        }
      }

      store.dispatch({
        type: 'updated-session',
        sessionID,
        updates,
      });
    },
    [store],
  );

  const deleteSession = useCallback(
    async (sessionID: string) => {
      // Dispatch action synchronously - persistence happens in useEffect
      // The persist effect will write the filtered sessions array via saveAll()
      store.dispatch({
        type: 'deleted-session',
        sessionID,
      });
    },
    [store],
  );

  const clearAllSessions = useCallback(async () => {
    store.dispatch({type: 'clear-all-sessions'});
  }, [store]);

  const contextValue: SessionContextType = useMemo(
    () => ({
      currentSession,
      currentUserID,
      sessions: state.sessions,
      switchSession,
      createSession,
      findOrCreateSession,
      updateSession,
      deleteSession,
      clearAllSessions,
      updateSessionToken,
      signIn,
      signOut,
      isLoading: state.isLoading,
      isLoggedIn,
    }),
    [
      currentSession,
      currentUserID,
      state.sessions,
      state.isLoading,
      switchSession,
      createSession,
      findOrCreateSession,
      updateSession,
      deleteSession,
      clearAllSessions,
      updateSessionToken,
      signIn,
      signOut,
      isLoggedIn,
    ],
  );

  return <SessionContext.Provider value={contextValue}>{children}</SessionContext.Provider>;
};
