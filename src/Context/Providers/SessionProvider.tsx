import React, {PropsWithChildren, useCallback, useEffect, useMemo, useRef, useSyncExternalStore} from 'react';
import {v4 as uuidv4} from 'uuid';

import {SessionContext, SessionContextType} from '#src/Context/Contexts/SessionContext';
import {SessionStore} from '#src/Context/State/SessionStore';
import {useOneTaskAtATime} from '#src/Hooks/useOneTaskAtATime';
import {SessionStorage} from '#src/Libraries/Storage/SessionStorage';
import {TokenStringData} from '#src/Structs/ControllerStructs';
import {Session} from '#src/Structs/SessionStructs';

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

  // Operation cancellation hook to prevent overlapping async operations
  // Based on Bluesky's useOneTaskAtATime pattern
  const cancelPendingTask = useOneTaskAtATime();

  // Load initial state from storage on mount
  useEffect(() => {
    const loadSessions = async () => {
      const signal = cancelPendingTask();
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
        console.error('[SessionProvider] Error loading sessions:', error);
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
      const signal = cancelPendingTask();

      try {
        // Persist all sessions
        for (const session of state.sessions) {
          if (signal.aborted) return;
          await SessionStorage.save(session);
        }

        // Persist last session ID if current session exists
        if (state.currentSessionID) {
          if (signal.aborted) return;
          await SessionStorage.setLastSessionID(state.currentSessionID);
        } else {
          if (signal.aborted) return;
          await SessionStorage.setLastSessionID('');
        }

        if (!signal.aborted) {
          store.markPersisted();
        }
      } catch (error) {
        console.error('[SessionProvider] Error persisting sessions:', error);
      }
    };

    persistState();
  }, [state.needsPersist, state.sessions, state.currentSessionID, store, cancelPendingTask]);

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
        console.warn('[SessionProvider] Attempted to switch to non-existent session:', sessionID);
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

  const updateSession = useCallback(
    async (sessionID: string, updates: Partial<Session>) => {
      const session = state.sessions.find(s => s.sessionID === sessionID);
      if (!session) {
        console.warn('[SessionProvider] Attempted to update non-existent session:', sessionID);
        return;
      }

      // Dispatch action synchronously - persistence happens in useEffect
      store.dispatch({
        type: 'updated-session',
        sessionID,
        updates,
      });
    },
    [state.sessions, store],
  );

  const deleteSession = useCallback(
    async (sessionID: string) => {
      // Dispatch action synchronously - persistence happens in useEffect
      store.dispatch({
        type: 'deleted-session',
        sessionID,
      });

      // Also delete from storage immediately (reducer handles state)
      try {
        await SessionStorage.deleteSession(sessionID);
        if (state.currentSessionID === sessionID) {
          await SessionStorage.setLastSessionID('');
        }
      } catch (error) {
        console.error('[SessionProvider] Error deleting session from storage:', error);
      }
    },
    [state.currentSessionID, store],
  );

  const updateSessionToken = useCallback(
    async (sessionID: string, tokenData: TokenStringData | null) => {
      const session = state.sessions.find(s => s.sessionID === sessionID);
      if (!session) {
        console.warn('[SessionProvider] Attempted to update token for non-existent session:', sessionID);
        return;
      }

      // Dispatch action synchronously - persistence happens in useEffect
      store.dispatch({
        type: 'updated-session',
        sessionID,
        updates: {tokenData},
      });
    },
    [state.sessions, store],
  );

  const signIn = useCallback(
    async (tokenData: TokenStringData) => {
      if (!currentSession) {
        console.error('[SessionProvider] Cannot sign in: no current session');
        return;
      }
      await updateSessionToken(currentSession.sessionID, tokenData);
    },
    [currentSession, updateSessionToken],
  );

  const signOut = useCallback(async () => {
    if (!currentSession) {
      console.error('[SessionProvider] Cannot sign out: no current session');
      return;
    }
    await updateSessionToken(currentSession.sessionID, null);
  }, [currentSession, updateSessionToken]);

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
      updateSessionToken,
      signIn,
      signOut,
      isLoggedIn,
    ],
  );

  return <SessionContext.Provider value={contextValue}>{children}</SessionContext.Provider>;
};
