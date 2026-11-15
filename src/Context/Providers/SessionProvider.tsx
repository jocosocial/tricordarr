import React, {PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore} from 'react';
import {v4 as uuidv4} from 'uuid';

import {useDeviceConfig} from '#src/Context/Contexts/DeviceConfigContext';
import {
  SessionContext,
  SessionContextType,
  SignInOptions,
  SwitchOptions,
  SwitchResult,
} from '#src/Context/Contexts/SessionContext';
import {selectCurrentSession, SessionAction, SessionState} from '#src/Context/State/SessionState';
import {SessionStore} from '#src/Context/State/SessionStore';
import {AccountPreferences} from '#src/Libraries/AppConfig';
import {createLogger} from '#src/Libraries/Logger';
import {stashNavigationState} from '#src/Libraries/NavigationRef';
import {fetchWhoami} from '#src/Libraries/Network/ServerAuth';
import {stopPushProvider} from '#src/Libraries/Notifications/Push';
import {normalizeServerUrl} from '#src/Libraries/ServerUrl';
import {loadSessionData} from '#src/Libraries/Storage/SessionLoader';
import {SessionStorage} from '#src/Libraries/Storage/SessionStorage';
import {TokenStringData} from '#src/Structs/ControllerStructs';
import {Account, ServerProfile} from '#src/Structs/SessionStructs';

const logger = createLogger('SessionProvider.tsx');

/**
 * SessionProvider owns accounts, sessions and server profiles in a reducer-backed store read via
 * useSyncExternalStore, so state access is synchronous and persistence happens in `dispatch`
 * (see SessionStore) rather than in an effect.
 *
 * Withholds children until the store has loaded from storage (same pattern as ConfigProvider) so
 * nothing fires against a default server while a real session is still hydrating.
 *
 * Architecture based on Bluesky's session management:
 * https://github.com/bluesky-social/social-app/blob/55806f10870128f7702714b5968c64a0e908281e/src/state/session/index.tsx
 */
export const SessionProvider = ({children}: PropsWithChildren) => {
  const {deviceConfig} = useDeviceConfig();
  // Create store instance (persists across renders)
  const storeRef = useRef<SessionStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = new SessionStore();
  }
  const store = storeRef.current;

  // Subscribe to store changes using useSyncExternalStore for synchronous state access
  const state: SessionState = useSyncExternalStore(
    store.subscribe.bind(store),
    store.getState.bind(store),
    store.getState.bind(store), // Server snapshot (same as client for React Native)
  );

  const [pendingAccountID, setPendingAccountID] = useState<string | null>(null);
  // A ref as well as state: the race guard must see a switch that was accepted a moment ago in the
  // same tick, before React has re-rendered with the state value.
  const pendingRef = useRef<string | null>(null);
  const [freshServerSessionID, setFreshServerSessionID] = useState<string | null>(null);

  // Load (and if needed migrate) from storage on mount.
  useEffect(() => {
    let cancelled = false;
    loadSessionData()
      .then(({data, persist}) => {
        if (!cancelled) {
          store.dispatch({type: 'loaded', persist, ...data});
        }
      })
      .catch(error => {
        logger.error('Error loading sessions:', error);
        if (!cancelled) {
          // Still dispatch with empty state to mark as loaded.
          store.dispatch({
            type: 'loaded',
            accounts: [],
            sessions: [],
            serverProfiles: [],
            tokens: {},
            preferences: {},
            lastSessionID: null,
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [store]);

  const currentSession = useMemo(() => selectCurrentSession(state), [state]);

  const currentAccount = useMemo(
    () => state.accounts.find(a => a.accountID === currentSession?.accountID) ?? null,
    [state.accounts, currentSession],
  );

  const currentToken = useMemo(() => {
    if (!currentAccount || currentAccount.status !== 'signedIn') {
      return null;
    }
    return state.tokens[currentAccount.accountID] ?? null;
  }, [currentAccount, state.tokens]);

  const accountPreferences = useMemo(
    () => (currentAccount ? (state.preferences[currentAccount.accountID] ?? null) : null),
    [currentAccount, state.preferences],
  );

  const serverProfile = useMemo(
    () => state.serverProfiles.find(p => p.serverUrl === currentSession?.serverUrl) ?? null,
    [state.serverProfiles, currentSession?.serverUrl],
  );

  const currentUserID = currentToken ? (currentAccount?.userID ?? null) : null;
  const isLoggedIn = !!currentToken;

  /**
   * Dispatch with the non-deterministic inputs (time, a candidate session id) filled in.
   */
  const dispatchStamped = useCallback(
    <T extends SessionAction['type']>(
      build: (ctx: {now: string; newSessionID: string}) => Extract<SessionAction, {type: T}>,
    ) => {
      store.dispatch(build({now: new Date().toISOString(), newSessionID: uuidv4()}));
    },
    [store],
  );

  /**
   * Remember sessions created by an action as needing the server's client settings applied.
   */
  const trackFreshSession = useCallback(
    (beforeIDs: Set<string>) => {
      const after = selectCurrentSession(store.getState());
      if (after && !beforeIDs.has(after.sessionID)) {
        setFreshServerSessionID(after.sessionID);
      }
    },
    [store],
  );

  /**
   * Shared shape of every switch: ignore if one is pending, stop the old account's background
   * providers (they are device-global, not scoped to the remounting subtree), freeze the visible
   * screen, then dispatch. The keyed SessionBoundaryProvider remount does the rest.
   */
  const runSwitch = useCallback(
    async (pendingID: string | null, options: SwitchOptions | undefined, dispatch: () => void) => {
      options?.onSwitchStart?.();
      if (options?.preserveNavigation) {
        stashNavigationState();
      }
      try {
        await stopPushProvider();
      } catch (error) {
        logger.error('Failed to stop push provider before switch:', error);
      }
      const before = new Set(store.getState().sessions.map(s => s.sessionID));
      dispatch();
      trackFreshSession(before);
      if (pendingID) {
        // Let the remount happen before another switch is allowed.
        setTimeout(() => {
          pendingRef.current = null;
          setPendingAccountID(null);
        }, 0);
      }
    },
    [store, trackFreshSession],
  );

  const switchToAccount = useCallback(
    async (accountID: string, options?: SwitchOptions): Promise<SwitchResult> => {
      if (pendingRef.current) {
        logger.debug('Switch already pending, ignoring switch to', accountID);
        return 'ignored';
      }
      const current = store.getState();
      const account = current.accounts.find(a => a.accountID === accountID);
      if (!account) {
        logger.warn('Attempted to switch to non-existent account:', accountID);
        return 'ignored';
      }
      if (account.status !== 'signedIn' || !current.tokens[accountID]) {
        return 'needs-login';
      }
      const target = [...current.sessions]
        .filter(s => s.accountID === accountID)
        .sort((a, b) => b.lastUsedAt.localeCompare(a.lastUsedAt))[0];
      if (!target) {
        logger.warn('Account has no session:', accountID);
        return 'ignored';
      }
      if (target.sessionID === current.currentSessionID) {
        return 'ignored';
      }
      pendingRef.current = accountID;
      setPendingAccountID(accountID);
      await runSwitch(accountID, options, () =>
        store.dispatch({type: 'switched-to-session', sessionID: target.sessionID, now: new Date().toISOString()}),
      );
      return 'switched';
    },
    [store, runSwitch],
  );

  const switchToSession = useCallback(
    async (sessionID: string, options?: SwitchOptions) => {
      if (pendingRef.current) {
        return;
      }
      const current = store.getState();
      const target = current.sessions.find(s => s.sessionID === sessionID);
      if (!target) {
        logger.warn('Attempted to switch to non-existent session:', sessionID);
        return;
      }
      if (target.sessionID === current.currentSessionID) {
        return;
      }
      const pendingID = target.accountID ?? sessionID;
      pendingRef.current = pendingID;
      setPendingAccountID(pendingID);
      await runSwitch(pendingID, options, () =>
        store.dispatch({type: 'switched-to-session', sessionID, now: new Date().toISOString()}),
      );
    },
    [store, runSwitch],
  );

  /**
   * Pre-registration mode is the server's own setting, read from /client/settings once a session
   * on it loads. For a server nothing is known about yet, assume it from whether this is the
   * pre-registration server, so the new session does not start out in the wrong mode.
   */
  const seedServerProfile = useCallback(
    (serverUrl: string) => {
      const known = store.getState().serverProfiles.find(p => p.serverUrl === serverUrl);
      if (known?.preRegistrationMode !== undefined) {
        return;
      }
      store.dispatch({
        type: 'server-profile-updated',
        serverUrl,
        patch: {preRegistrationMode: serverUrl === normalizeServerUrl(deviceConfig.preRegistrationServerUrl)},
        now: new Date().toISOString(),
      });
    },
    [store, deviceConfig.preRegistrationServerUrl],
  );

  const switchToServer = useCallback(
    async (serverUrl: string, options?: SwitchOptions) => {
      if (pendingRef.current) {
        return;
      }
      const normalized = normalizeServerUrl(serverUrl);
      const current = selectCurrentSession(store.getState());
      if (current && current.accountID === null && current.serverUrl === normalized) {
        return;
      }
      seedServerProfile(normalized);
      pendingRef.current = normalized;
      setPendingAccountID(normalized);
      await runSwitch(normalized, options, () =>
        dispatchStamped(({now, newSessionID}) => ({
          type: 'switched-to-server',
          serverUrl: normalized,
          newSessionID,
          boardFromSessionID: options?.boardFromSessionID,
          now,
        })),
      );
    },
    [store, runSwitch, dispatchStamped, seedServerProfile],
  );

  const signIn = useCallback(
    async (serverUrl: string, token: TokenStringData, options?: SignInOptions): Promise<Account> => {
      const normalized = normalizeServerUrl(serverUrl);
      // The whoami read is best effort: a login that succeeded must not fail because this did.
      let username = '';
      let accessLevel = token.accessLevel;
      try {
        const whoami = await fetchWhoami(
          normalized,
          deviceConfig.urlPrefix,
          token.token,
          deviceConfig.apiClientConfig.requestTimeout,
        );
        username = whoami.username;
        accessLevel = whoami.accessLevel;
      } catch (error) {
        logger.warn('Unable to read whoami during sign in:', error);
      }

      seedServerProfile(normalized);
      const current = store.getState();

      // Block switches for the instant the scope remounts, same as the explicit switches.
      pendingRef.current = normalized;
      setPendingAccountID(normalized);
      try {
        await stopPushProvider();
      } catch (error) {
        logger.error('Failed to stop push provider before sign in:', error);
      }
      const before = new Set(current.sessions.map(s => s.sessionID));
      const now = new Date().toISOString();
      const existing = current.accounts.find(a => a.serverUrl === normalized && a.userID === token.userID);
      const account: Account = {
        accountID: existing?.accountID ?? uuidv4(),
        serverUrl: normalized,
        userID: token.userID,
        username,
        accessLevel,
        status: 'signedIn',
        createdAt: now,
        lastUsedAt: now,
      };
      if (options?.siteCookie) {
        try {
          await SessionStorage.setCookieForAccount(account.accountID, options.siteCookie);
        } catch (error) {
          logger.error('Failed to store site cookie:', error);
        }
      }
      store.dispatch({
        type: 'account-signed-in',
        account,
        token,
        newSessionID: uuidv4(),
        preferences: deviceConfig.defaultPreferences,
        boardFromSessionID: options?.boardFromSessionID,
        now,
      });
      trackFreshSession(before);
      setTimeout(() => {
        pendingRef.current = null;
        setPendingAccountID(null);
      }, 0);
      const stored = store.getState().accounts.find(a => a.serverUrl === normalized && a.userID === token.userID);
      return stored ?? account;
    },
    [store, deviceConfig, trackFreshSession, seedServerProfile],
  );

  const signOut = useCallback(
    async (accountID?: string) => {
      const target = accountID ?? selectCurrentSession(store.getState())?.accountID;
      if (!target) {
        logger.error('Cannot sign out: no account');
        return;
      }
      const isCurrent = selectCurrentSession(store.getState())?.accountID === target;
      if (isCurrent) {
        try {
          await stopPushProvider();
        } catch (error) {
          logger.error('Failed to stop push provider before sign out:', error);
        }
      }
      const before = new Set(store.getState().sessions.map(s => s.sessionID));
      dispatchStamped(({now, newSessionID}) => ({type: 'account-signed-out', accountID: target, newSessionID, now}));
      trackFreshSession(before);
    },
    [store, dispatchStamped, trackFreshSession],
  );

  const removeAccount = useCallback(
    async (accountID: string, options?: SwitchOptions) => {
      const isCurrent = selectCurrentSession(store.getState())?.accountID === accountID;
      if (isCurrent) {
        options?.onSwitchStart?.();
        try {
          await stopPushProvider();
        } catch (error) {
          logger.error('Failed to stop push provider before remove:', error);
        }
      }
      const before = new Set(store.getState().sessions.map(s => s.sessionID));
      dispatchStamped(({now, newSessionID}) => ({type: 'account-removed', accountID, newSessionID, now}));
      trackFreshSession(before);
    },
    [store, dispatchStamped, trackFreshSession],
  );

  const removeSession = useCallback(
    async (sessionID: string, options?: SwitchOptions) => {
      const isCurrent = store.getState().currentSessionID === sessionID;
      if (isCurrent) {
        options?.onSwitchStart?.();
        try {
          await stopPushProvider();
        } catch (error) {
          logger.error('Failed to stop push provider before removing session:', error);
        }
      }
      store.dispatch({type: 'session-removed', sessionID, now: new Date().toISOString()});
    },
    [store],
  );

  const updateAccountPreferences = useCallback(
    async (accountID: string, patch: Partial<AccountPreferences>) => {
      store.dispatch({type: 'preferences-updated', accountID, patch});
    },
    [store],
  );

  const updateServerProfile = useCallback(
    async (serverUrl: string, patch: Partial<Omit<ServerProfile, 'serverUrl' | 'updatedAt'>>) => {
      dispatchStamped(({now}) => ({
        type: 'server-profile-updated',
        serverUrl: normalizeServerUrl(serverUrl),
        patch,
        now,
      }));
    },
    [dispatchStamped],
  );

  const setPreRegistrationOverride = useCallback(
    async (serverUrl: string, preRegistrationMode: boolean) => {
      const normalized = normalizeServerUrl(serverUrl);
      const reported = store.getState().serverProfiles.find(p => p.serverUrl === normalized)?.preRegistrationMode;
      dispatchStamped(({now}) => ({
        type: 'server-profile-updated',
        serverUrl: normalized,
        patch: {preRegistrationOverride: preRegistrationMode === (reported ?? false) ? undefined : preRegistrationMode},
        now,
      }));
    },
    [store, dispatchStamped],
  );

  const updateAccountIdentity = useCallback(
    async (
      accountID: string,
      patch: Partial<Pick<Account, 'username' | 'displayName' | 'userImage' | 'accessLevel'>>,
      sourceSessionID: string,
    ) => {
      store.dispatch({type: 'account-updated', accountID, patch, sourceSessionID});
    },
    [store],
  );

  const markAccountRevoked = useCallback(
    async (accountID: string, sourceSessionID: string) => {
      const before = new Set(store.getState().sessions.map(s => s.sessionID));
      dispatchStamped(({now, newSessionID}) => ({
        type: 'account-revoked',
        accountID,
        newSessionID,
        sourceSessionID,
        now,
      }));
      trackFreshSession(before);
    },
    [store, dispatchStamped, trackFreshSession],
  );

  const clearAllSessions = useCallback(async () => {
    store.dispatch({type: 'cleared'});
  }, [store]);

  const clearFreshServerSession = useCallback(() => setFreshServerSessionID(null), []);

  const contextValue: SessionContextType = useMemo(
    () => ({
      currentSession,
      currentAccount,
      currentToken,
      currentUserID,
      accounts: state.accounts,
      sessions: state.sessions,
      serverProfiles: state.serverProfiles,
      serverProfile,
      accountPreferences,
      isLoggedIn,
      isLoading: state.isLoading,
      pendingAccountID,
      freshServerSessionID,
      clearFreshServerSession,
      signIn,
      signOut,
      switchToAccount,
      switchToSession,
      switchToServer,
      removeSession,
      removeAccount,
      updateAccountPreferences,
      updateServerProfile,
      setPreRegistrationOverride,
      updateAccountIdentity,
      markAccountRevoked,
      clearAllSessions,
      getTokenForAccount: SessionStorage.getTokenForAccount,
    }),
    [
      currentSession,
      currentAccount,
      currentToken,
      currentUserID,
      state.accounts,
      state.sessions,
      state.serverProfiles,
      state.isLoading,
      serverProfile,
      accountPreferences,
      isLoggedIn,
      pendingAccountID,
      freshServerSessionID,
      clearFreshServerSession,
      signIn,
      signOut,
      switchToAccount,
      switchToSession,
      switchToServer,
      removeSession,
      removeAccount,
      updateAccountPreferences,
      updateServerProfile,
      setPreRegistrationOverride,
      updateAccountIdentity,
      markAccountRevoked,
      clearAllSessions,
    ],
  );

  // Match ConfigProvider: do not mount children until storage has been read.
  // https://github.com/jocosocial/tricordarr/issues/564
  if (state.isLoading) {
    logger.debug('Sessions are not ready.');
    return null;
  }

  return <SessionContext.Provider value={contextValue}>{children}</SessionContext.Provider>;
};
