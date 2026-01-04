import React, {PropsWithChildren, useCallback, useEffect, useMemo, useState} from 'react';
import {v4 as uuidv4} from 'uuid';

import {SessionContext, SessionContextType} from '#src/Context/Contexts/SessionContext';
import {SessionStorage} from '#src/Libraries/Storage/SessionStorage';
import {TokenStringData} from '#src/Structs/ControllerStructs';
import {Session} from '#src/Structs/SessionStructs';

export const SessionProvider = ({children}: PropsWithChildren) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionID, setCurrentSessionID] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load sessions from storage on mount
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const loadedSessions = await SessionStorage.getAll();
        setSessions(loadedSessions);

        // Try to restore last session
        const lastSessionID = await SessionStorage.getLastSessionID();
        if (lastSessionID) {
          const session = loadedSessions.find(s => s.sessionID === lastSessionID);
          if (session) {
            setCurrentSessionID(lastSessionID);
          }
        }
      } catch (error) {
        console.error('[SessionProvider] Error loading sessions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSessions();
  }, []);

  const currentSession = useMemo(() => {
    if (!currentSessionID) {
      return null;
    }
    return sessions.find(s => s.sessionID === currentSessionID) || null;
  }, [sessions, currentSessionID]);

  const currentUserID = useMemo(() => {
    return currentSession?.tokenData?.userID || null;
  }, [currentSession]);

  const isLoggedIn = useMemo(() => {
    return !!currentSession?.tokenData;
  }, [currentSession]);

  const switchSession = useCallback(
    async (sessionID: string) => {
      const session = sessions.find(s => s.sessionID === sessionID);
      if (!session) {
        console.warn('[SessionProvider] Attempted to switch to non-existent session:', sessionID);
        return;
      }

      // Update lastUsedAt
      const updatedSession: Session = {
        ...session,
        lastUsedAt: new Date().toISOString(),
      };
      await SessionStorage.save(updatedSession);
      setSessions(prev => prev.map(s => (s.sessionID === sessionID ? updatedSession : s)));

      // Update current session
      // Note: lastSessionID is not set here - it's set when OOBE completes
      setCurrentSessionID(sessionID);
    },
    [sessions],
  );

  const createSession = useCallback(async (serverUrl: string, preRegistrationMode: boolean): Promise<Session> => {
    const now = new Date().toISOString();
    const newSession: Session = {
      sessionID: uuidv4(),
      serverUrl,
      preRegistrationMode,
      tokenData: null,
      createdAt: now,
      lastUsedAt: now,
    };

    // Persist immediately
    await SessionStorage.save(newSession);
    setSessions(prev => [...prev, newSession]);

    // Switch to new session
    // Note: lastSessionID is not set here - it's set when OOBE completes
    setCurrentSessionID(newSession.sessionID);

    return newSession;
  }, []);

  const findOrCreateSession = useCallback(
    async (serverUrl: string, preRegistrationMode: boolean): Promise<Session> => {
      // Try to find existing session matching criteria
      const existing = sessions.find(s => s.serverUrl === serverUrl && s.preRegistrationMode === preRegistrationMode);

      if (existing) {
        // Switch to existing session
        await switchSession(existing.sessionID);
        return existing;
      }

      // Create new session
      return await createSession(serverUrl, preRegistrationMode);
    },
    [sessions, switchSession, createSession],
  );

  const updateSession = useCallback(
    async (sessionID: string, updates: Partial<Session>) => {
      const session = sessions.find(s => s.sessionID === sessionID);
      if (!session) {
        console.warn('[SessionProvider] Attempted to update non-existent session:', sessionID);
        return;
      }

      const updatedSession: Session = {
        ...session,
        ...updates,
        lastUsedAt: new Date().toISOString(),
      };

      // Persist immediately
      await SessionStorage.save(updatedSession);
      setSessions(prev => prev.map(s => (s.sessionID === sessionID ? updatedSession : s)));

      // If this is the current session, update currentSessionID state will reflect the change
      // via the useMemo dependency
    },
    [sessions],
  );

  const deleteSession = useCallback(
    async (sessionID: string) => {
      // Persist deletion immediately
      await SessionStorage.deleteSession(sessionID);
      setSessions(prev => prev.filter(s => s.sessionID !== sessionID));

      // If deleting current session, clear it
      if (currentSessionID === sessionID) {
        setCurrentSessionID(null);
        await SessionStorage.setLastSessionID('');
      }
    },
    [currentSessionID],
  );

  const updateSessionToken = useCallback(
    async (sessionID: string, tokenData: TokenStringData | null) => {
      const session = sessions.find(s => s.sessionID === sessionID);
      if (!session) {
        console.warn('[SessionProvider] Attempted to update token for non-existent session:', sessionID);
        return;
      }

      const updatedSession: Session = {
        ...session,
        tokenData,
        lastUsedAt: new Date().toISOString(),
      };

      console.log('YYYYYYY [SessionProvider] updateSessionToken', updatedSession);

      // Persist immediately
      await SessionStorage.save(updatedSession);
      setSessions(prev => prev.map(s => (s.sessionID === sessionID ? updatedSession : s)));
    },
    [sessions],
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
      sessions,
      switchSession,
      createSession,
      findOrCreateSession,
      updateSession,
      deleteSession,
      updateSessionToken,
      signIn,
      signOut,
      isLoading,
      isLoggedIn,
    }),
    [
      currentSession,
      currentUserID,
      sessions,
      switchSession,
      createSession,
      findOrCreateSession,
      updateSession,
      deleteSession,
      updateSessionToken,
      signIn,
      signOut,
      isLoading,
      isLoggedIn,
    ],
  );

  return <SessionContext.Provider value={contextValue}>{children}</SessionContext.Provider>;
};
