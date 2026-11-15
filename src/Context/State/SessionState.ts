import {AccountPreferences} from '#src/Libraries/AppConfig';
import {createLogger} from '#src/Libraries/Logger';
import {TokenStringData} from '#src/Structs/ControllerStructs';
import {Account, ServerProfile, Session} from '#src/Structs/SessionStructs';

const logger = createLogger('SessionState.ts');

/**
 * Internal state structure for session management.
 * Inspired by Bluesky's session state management:
 * https://github.com/bluesky-social/social-app/blob/55806f10870128f7702714b5968c64a0e908281e/src/state/session/index.tsx
 *
 * Tokens and preferences are held in memory so the API client and config merge can read them
 * synchronously; SessionPersistence writes each one to its own storage key.
 */
export interface SessionState {
  /** Most-recently-used first. */
  accounts: Account[];
  sessions: Session[];
  serverProfiles: ServerProfile[];
  /** accountID -> token. Absent for signed out and revoked accounts. */
  tokens: Record<string, TokenStringData>;
  /** accountID -> preferences. */
  preferences: Record<string, AccountPreferences>;
  currentSessionID: string | null;
  isLoading: boolean;
}

/**
 * Everything a `loaded` action hands the reducer, as read (and possibly migrated) from storage.
 */
export interface LoadedSessionData {
  accounts: Account[];
  sessions: Session[];
  serverProfiles: ServerProfile[];
  tokens: Record<string, TokenStringData>;
  preferences: Record<string, AccountPreferences>;
  lastSessionID: string | null;
}

/**
 * Action types for session state transitions. The reducer is pure, so anything non-deterministic
 * (ids, timestamps) arrives on the action.
 *
 * `sourceSessionID` is Bluesky's stale-source guard: an action produced asynchronously (a whoami
 * result, a 401 handler) carries the session it was produced for, and the reducer ignores it if
 * that session is no longer current. This is what stops a late response from account A touching
 * A's row after the user has switched to B.
 */
export type SessionAction =
  | ({type: 'loaded'; persist?: boolean} & LoadedSessionData)
  | {
      /** Upsert on (serverUrl, userID), find-or-create its session, and switch to it. */
      type: 'account-signed-in';
      account: Account;
      token: TokenStringData;
      /** Used only if a new session has to be created. */
      newSessionID: string;
      /** Preferences for an account that has none yet. */
      preferences: AccountPreferences;
      /** Boarding: the pre-registration session being left for good. See retireServer. */
      boardFromSessionID?: string;
      now: string;
    }
  | {
      /** Clear the token, keep the row. Switches away if it was current. */
      type: 'account-signed-out';
      accountID: string;
      newSessionID: string;
      now: string;
    }
  | {
      /** Like signed-out, but from a 401 on a token route. */
      type: 'account-revoked';
      accountID: string;
      newSessionID: string;
      sourceSessionID?: string;
      now: string;
    }
  | {
      /** Delete the account, its token, its preferences and every session that references it. */
      type: 'account-removed';
      accountID: string;
      newSessionID: string;
      now: string;
    }
  | {
      type: 'account-updated';
      accountID: string;
      patch: Partial<Pick<Account, 'username' | 'displayName' | 'userImage' | 'accessLevel'>>;
      sourceSessionID?: string;
    }
  | {
      /**
       * Delete one session and its cache file without touching its account (which may have others).
       * For anonymous server sessions; an account's sessions go with `account-removed`.
       */
      type: 'session-removed';
      sessionID: string;
      now: string;
    }
  | {type: 'switched-to-session'; sessionID: string; now: string}
  | {
      /** Find-or-create the anonymous session for a server and switch to it. */
      type: 'switched-to-server';
      serverUrl: string;
      newSessionID: string;
      /** Boarding: the pre-registration session being left for good. See retireServer. */
      boardFromSessionID?: string;
      now: string;
    }
  | {
      type: 'server-profile-updated';
      serverUrl: string;
      patch: Partial<Omit<ServerProfile, 'serverUrl' | 'updatedAt'>>;
      sourceSessionID?: string;
      now: string;
    }
  | {type: 'preferences-updated'; accountID: string; patch: Partial<AccountPreferences>}
  | {type: 'cleared'};

/**
 * Get initial state for session store.
 */
export function getInitialState(): SessionState {
  return {
    accounts: [],
    sessions: [],
    serverProfiles: [],
    tokens: {},
    preferences: {},
    currentSessionID: null,
    isLoading: true,
  };
}

/**
 * The session a state points at, if any.
 */
export const selectCurrentSession = (state: SessionState): Session | null =>
  state.sessions.find(s => s.sessionID === state.currentSessionID) ?? null;

/**
 * True if an action's source session is no longer the current one.
 */
const isStale = (state: SessionState, sourceSessionID?: string): boolean =>
  sourceSessionID !== undefined && sourceSessionID !== state.currentSessionID;

/**
 * Find a session by its dedupe key, (serverUrl, accountID).
 */
const findSession = (sessions: Session[], serverUrl: string, accountID: string | null): Session | undefined =>
  sessions.find(s => s.serverUrl === serverUrl && s.accountID === accountID);

/**
 * Make `sessionID` current, stamping its lastUsedAt and moving its account to the front of the
 * MRU list.
 */
const activateSession = (state: SessionState, sessionID: string, now: string): SessionState => {
  const session = state.sessions.find(s => s.sessionID === sessionID);
  if (!session) {
    logger.warn('Attempted to switch to non-existent session:', sessionID);
    return state;
  }
  const accountID = session.accountID;
  const touchedAccount = state.accounts.find(a => a.accountID === accountID);
  return {
    ...state,
    sessions: state.sessions.map(s => (s.sessionID === sessionID ? {...s, lastUsedAt: now} : s)),
    accounts: touchedAccount
      ? [{...touchedAccount, lastUsedAt: now}, ...state.accounts.filter(a => a.accountID !== accountID)]
      : state.accounts,
    currentSessionID: sessionID,
  };
};

/**
 * Switch away from a session whose account is going away: to the most recently used other
 * signed-in account's most recently used session, else to the anonymous session for the same
 * server (created if needed).
 */
const leaveSession = (state: SessionState, leaving: Session, newSessionID: string, now: string): SessionState => {
  for (const account of state.accounts) {
    if (account.accountID === leaving.accountID || account.status !== 'signedIn') {
      continue;
    }
    const candidates = state.sessions
      .filter(s => s.accountID === account.accountID)
      .sort((a, b) => b.lastUsedAt.localeCompare(a.lastUsedAt));
    if (candidates.length > 0) {
      return activateSession(state, candidates[0].sessionID, now);
    }
  }
  return reduceSwitchedToServer(state, leaving.serverUrl, newSessionID, now);
};

/**
 * Find or create the anonymous session for a server and make it current.
 */
const reduceSwitchedToServer = (
  state: SessionState,
  serverUrl: string,
  newSessionID: string,
  now: string,
): SessionState => {
  const existing = findSession(state.sessions, serverUrl, null);
  if (existing) {
    return activateSession(state, existing.sessionID, now);
  }
  const created: Session = {
    sessionID: newSessionID,
    serverUrl,
    accountID: null,
    createdAt: now,
    lastUsedAt: now,
  };
  return {...state, sessions: [...state.sessions, created], currentSessionID: created.sessionID};
};

/**
 * Boarding cutoff: delete everything on a server (its accounts with their tokens and preferences,
 * its sessions and its profile) so there is nothing left to switch back to. Called on the state
 * that has already moved to the new server, in the same reduction, so both never exist at once.
 * Does nothing if the current session is on that server (boarding onto the server being left).
 */
const retireServer = (state: SessionState, serverUrl: string): SessionState => {
  if (selectCurrentSession(state)?.serverUrl === serverUrl) {
    logger.warn('Not retiring the server the current session is on:', serverUrl);
    return state;
  }
  const retired = new Set(state.accounts.filter(a => a.serverUrl === serverUrl).map(a => a.accountID));
  const keep = <T>(record: Record<string, T>): Record<string, T> =>
    Object.fromEntries(Object.entries(record).filter(([accountID]) => !retired.has(accountID)));
  return {
    ...state,
    accounts: state.accounts.filter(a => !retired.has(a.accountID)),
    sessions: state.sessions.filter(s => s.serverUrl !== serverUrl),
    serverProfiles: state.serverProfiles.filter(p => p.serverUrl !== serverUrl),
    tokens: keep(state.tokens),
    preferences: keep(state.preferences),
  };
};

/**
 * Drop an account's token and mark it signedOut/revoked, switching away if it was current.
 */
const reduceLeaveAccount = (
  state: SessionState,
  accountID: string,
  status: 'signedOut' | 'revoked',
  newSessionID: string,
  now: string,
): SessionState => {
  const account = state.accounts.find(a => a.accountID === accountID);
  if (!account) {
    logger.warn('Attempted to sign out non-existent account:', accountID);
    return state;
  }
  const {[accountID]: _removed, ...tokens} = state.tokens;
  const next: SessionState = {
    ...state,
    accounts: state.accounts.map(a => (a.accountID === accountID ? {...a, status} : a)),
    tokens,
  };
  const current = selectCurrentSession(next);
  if (current && current.accountID === accountID) {
    return leaveSession(next, current, newSessionID, now);
  }
  return next;
};

/**
 * Pure reducer function for session state transitions.
 * All state changes go through this function to ensure atomicity.
 * Based on Bluesky's reducer pattern:
 * https://github.com/bluesky-social/social-app/blob/55806f10870128f7702714b5968c64a0e908281e/src/state/session/index.tsx
 */
export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'loaded': {
      const current = action.sessions.find(s => s.sessionID === action.lastSessionID);
      return {
        accounts: action.accounts,
        sessions: action.sessions,
        serverProfiles: action.serverProfiles,
        tokens: action.tokens,
        preferences: action.preferences,
        currentSessionID: current ? current.sessionID : null,
        isLoading: false,
      };
    }

    case 'account-signed-in': {
      const incoming = action.account;
      const existing = state.accounts.find(a => a.serverUrl === incoming.serverUrl && a.userID === incoming.userID);
      const accountID = existing?.accountID ?? incoming.accountID;
      const account: Account = {
        ...(existing ?? incoming),
        ...incoming,
        accountID,
        createdAt: existing?.createdAt ?? incoming.createdAt,
        status: 'signedIn',
        lastUsedAt: action.now,
      };
      // Boarding carries the pre-registration account's preferences over to the account replacing it.
      const boardingFrom = state.sessions.find(s => s.sessionID === action.boardFromSessionID);
      const initialPreferences =
        (boardingFrom?.accountID ? state.preferences[boardingFrom.accountID] : undefined) ?? action.preferences;
      let sessions = state.sessions;
      let session = findSession(sessions, account.serverUrl, accountID);
      if (!session) {
        session = {
          sessionID: action.newSessionID,
          serverUrl: account.serverUrl,
          accountID,
          createdAt: action.now,
          lastUsedAt: action.now,
        };
        sessions = [...sessions, session];
      }
      const next = activateSession(
        {
          ...state,
          accounts: [account, ...state.accounts.filter(a => a.accountID !== accountID)],
          sessions,
          tokens: {...state.tokens, [accountID]: action.token},
          preferences: state.preferences[accountID]
            ? state.preferences
            : {...state.preferences, [accountID]: initialPreferences},
        },
        session.sessionID,
        action.now,
      );
      return boardingFrom ? retireServer(next, boardingFrom.serverUrl) : next;
    }

    case 'account-signed-out': {
      return reduceLeaveAccount(state, action.accountID, 'signedOut', action.newSessionID, action.now);
    }

    case 'account-revoked': {
      if (isStale(state, action.sourceSessionID)) {
        logger.debug('Ignoring stale account-revoked for', action.accountID);
        return state;
      }
      return reduceLeaveAccount(state, action.accountID, 'revoked', action.newSessionID, action.now);
    }

    case 'account-removed': {
      const account = state.accounts.find(a => a.accountID === action.accountID);
      if (!account) {
        logger.warn('Attempted to remove non-existent account:', action.accountID);
        return state;
      }
      const current = selectCurrentSession(state);
      const {[action.accountID]: _token, ...tokens} = state.tokens;
      const {[action.accountID]: _prefs, ...preferences} = state.preferences;
      const next: SessionState = {
        ...state,
        accounts: state.accounts.filter(a => a.accountID !== action.accountID),
        sessions: state.sessions.filter(s => s.accountID !== action.accountID),
        tokens,
        preferences,
      };
      if (current && current.accountID === action.accountID) {
        // Pointing at a session that no longer exists; leaveSession replaces it. The anonymous
        // fallback is built from the removed session's server.
        return leaveSession({...next, currentSessionID: null}, current, action.newSessionID, action.now);
      }
      return next;
    }

    case 'account-updated': {
      if (isStale(state, action.sourceSessionID)) {
        logger.debug('Ignoring stale account-updated for', action.accountID);
        return state;
      }
      const account = state.accounts.find(a => a.accountID === action.accountID);
      if (!account || account.status !== 'signedIn') {
        return state;
      }
      return {
        ...state,
        accounts: state.accounts.map(a => (a.accountID === action.accountID ? {...a, ...action.patch} : a)),
      };
    }

    case 'session-removed': {
      const removed = state.sessions.find(s => s.sessionID === action.sessionID);
      if (!removed) {
        return state;
      }
      const sessions = state.sessions.filter(s => s.sessionID !== action.sessionID);
      const next: SessionState = {...state, sessions};
      if (state.currentSessionID !== action.sessionID) {
        return next;
      }
      // Fall back to the most recently used remaining session, or none.
      const fallback = [...sessions].sort((a, b) => b.lastUsedAt.localeCompare(a.lastUsedAt))[0];
      return fallback
        ? activateSession({...next, currentSessionID: null}, fallback.sessionID, action.now)
        : {...next, currentSessionID: null};
    }

    case 'switched-to-session': {
      return activateSession(state, action.sessionID, action.now);
    }

    case 'switched-to-server': {
      const next = reduceSwitchedToServer(state, action.serverUrl, action.newSessionID, action.now);
      const boardingFrom = state.sessions.find(s => s.sessionID === action.boardFromSessionID);
      return boardingFrom ? retireServer(next, boardingFrom.serverUrl) : next;
    }

    case 'server-profile-updated': {
      if (isStale(state, action.sourceSessionID)) {
        logger.debug('Ignoring stale server-profile-updated for', action.serverUrl);
        return state;
      }
      const existing = state.serverProfiles.find(p => p.serverUrl === action.serverUrl);
      const profile: ServerProfile = {
        wifiNetworkNames: [],
        dismissMinAccessWarning: false,
        ...existing,
        ...action.patch,
        serverUrl: action.serverUrl,
        updatedAt: action.now,
      };
      return {
        ...state,
        serverProfiles: existing
          ? state.serverProfiles.map(p => (p.serverUrl === action.serverUrl ? profile : p))
          : [...state.serverProfiles, profile],
      };
    }

    case 'preferences-updated': {
      const existing = state.preferences[action.accountID];
      if (!existing) {
        logger.warn('Attempted to update preferences for unknown account:', action.accountID);
        return state;
      }
      return {...state, preferences: {...state.preferences, [action.accountID]: {...existing, ...action.patch}}};
    }

    case 'cleared': {
      return {...getInitialState(), isLoading: false};
    }

    default: {
      // TypeScript exhaustiveness check
      const _exhaustive: never = action;
      return state;
    }
  }
}
