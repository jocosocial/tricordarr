const mockAsyncStore = new Map<string, string>();
const mockSecureStore = new Map<string, string>();
const mockRemovedCacheKeys: string[] = [];

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (key: string) => mockAsyncStore.get(key) ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      mockAsyncStore.set(key, value);
    }),
    removeItem: jest.fn(async (key: string) => {
      mockAsyncStore.delete(key);
    }),
  },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async (key: string) => mockSecureStore.get(key) ?? null),
  setItemAsync: jest.fn(async (key: string, value: string) => {
    mockSecureStore.set(key, value);
  }),
  deleteItemAsync: jest.fn(async (key: string) => {
    mockSecureStore.delete(key);
  }),
}));

jest.mock('#src/Libraries/Storage/QueryCacheStorage', () => ({
  getQueryCacheKey: (sessionID: string) => `query-cache-${sessionID}`,
  queryCacheStorage: {
    removeItem: jest.fn((key: string) => {
      mockRemovedCacheKeys.push(key);
    }),
  },
}));

jest.mock('#src/Libraries/Logger', () => ({
  createLogger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

import {getInitialState, selectCurrentSession, sessionReducer, SessionState} from '#src/Context/State/SessionState';
import {SessionStore} from '#src/Context/State/SessionStore';
import {UserAccessLevel} from '#src/Enums/UserAccessLevel';
import {getAccountListEntries} from '#src/Libraries/Account';
import {defaultAccountPreferences} from '#src/Libraries/AppConfig';
import {persistSessionState} from '#src/Libraries/Storage/SessionPersistence';
import {SessionStorage} from '#src/Libraries/Storage/SessionStorage';
import {Account} from '#src/Structs/SessionStructs';

const SERVER = 'https://twitarr.com';
const OTHER_SERVER = 'https://beta.twitarr.com';

const t = (n: number) => new Date(2026, 0, 1, 0, 0, n).toISOString();

const makeAccount = (id: string, userID: string, serverUrl = SERVER): Account => ({
  accountID: id,
  serverUrl,
  userID,
  username: userID,
  accessLevel: UserAccessLevel.verified,
  status: 'signedIn',
  createdAt: t(0),
  lastUsedAt: t(0),
});

const token = (userID: string) => ({userID, accessLevel: UserAccessLevel.verified, token: `token-${userID}`});

const loaded = (): SessionState =>
  sessionReducer(getInitialState(), {
    type: 'loaded',
    accounts: [],
    sessions: [],
    serverProfiles: [],
    tokens: {},
    preferences: {},
    lastSessionID: null,
  });

const signIn = (state: SessionState, id: string, userID: string, sessionID: string, now: number, serverUrl = SERVER) =>
  sessionReducer(state, {
    type: 'account-signed-in',
    account: makeAccount(id, userID, serverUrl),
    token: token(userID),
    newSessionID: sessionID,
    preferences: defaultAccountPreferences,
    now: t(now),
  });

describe('sessionReducer', () => {
  it('sign in creates account and session and switches to it', () => {
    const state = signIn(loaded(), 'a1', 'u1', 's1', 1);
    expect(state.accounts).toHaveLength(1);
    expect(state.accounts[0]).toMatchObject({accountID: 'a1', status: 'signedIn'});
    expect(state.tokens.a1).toEqual(token('u1'));
    expect(state.preferences.a1).toEqual(defaultAccountPreferences);
    expect(state.sessions).toHaveLength(1);
    expect(state.currentSessionID).toBe('s1');
    expect(selectCurrentSession(state)?.accountID).toBe('a1');
  });

  it('a second sign in on the same server creates a second account, not an overwrite', () => {
    let state = signIn(loaded(), 'a1', 'u1', 's1', 1);
    state = signIn(state, 'a2', 'u2', 's2', 2);
    expect(state.accounts.map(a => a.accountID)).toEqual(['a2', 'a1']);
    expect(state.tokens.a1).toEqual(token('u1'));
    expect(state.tokens.a2).toEqual(token('u2'));
    expect(state.sessions).toHaveLength(2);
    expect(state.currentSessionID).toBe('s2');
  });

  it('signing in again as the same user upserts the account and reuses its session', () => {
    let state = signIn(loaded(), 'a1', 'u1', 's1', 1);
    state = sessionReducer(state, {type: 'account-signed-out', accountID: 'a1', newSessionID: 'anon', now: t(2)});
    state = signIn(state, 'a-new', 'u1', 's-new', 3);
    expect(state.accounts).toHaveLength(1);
    expect(state.accounts[0]).toMatchObject({accountID: 'a1', status: 'signedIn'});
    expect(state.currentSessionID).toBe('s1');
    expect(state.tokens.a1).toBeDefined();
  });

  it('sign out keeps the row and the other accounts tokens, and falls to the next signed-in account', () => {
    let state = signIn(loaded(), 'a1', 'u1', 's1', 1);
    state = signIn(state, 'a2', 'u2', 's2', 2);
    state = sessionReducer(state, {type: 'account-signed-out', accountID: 'a2', newSessionID: 'anon', now: t(3)});
    expect(state.accounts.find(a => a.accountID === 'a2')?.status).toBe('signedOut');
    expect(state.tokens.a2).toBeUndefined();
    expect(state.tokens.a1).toBeDefined();
    expect(state.currentSessionID).toBe('s1');
  });

  it('sign out of the only account falls to the anonymous session for that server', () => {
    let state = signIn(loaded(), 'a1', 'u1', 's1', 1);
    state = sessionReducer(state, {type: 'account-signed-out', accountID: 'a1', newSessionID: 'anon', now: t(2)});
    const current = selectCurrentSession(state);
    expect(current).toMatchObject({sessionID: 'anon', accountID: null, serverUrl: SERVER});
    expect(state.accounts).toHaveLength(1);
  });

  it('sign out of an inactive account does not move the current session', () => {
    let state = signIn(loaded(), 'a1', 'u1', 's1', 1);
    state = signIn(state, 'a2', 'u2', 's2', 2);
    state = sessionReducer(state, {type: 'account-signed-out', accountID: 'a1', newSessionID: 'anon', now: t(3)});
    expect(state.currentSessionID).toBe('s2');
    expect(state.sessions.some(s => s.sessionID === 'anon')).toBe(false);
  });

  it('removing the current account deletes it, its token, prefs and sessions, and switches away', () => {
    let state = signIn(loaded(), 'a1', 'u1', 's1', 1);
    state = signIn(state, 'a2', 'u2', 's2', 2);
    state = sessionReducer(state, {type: 'account-removed', accountID: 'a2', newSessionID: 'anon', now: t(3)});
    expect(state.accounts.map(a => a.accountID)).toEqual(['a1']);
    expect(state.tokens.a2).toBeUndefined();
    expect(state.preferences.a2).toBeUndefined();
    expect(state.sessions.some(s => s.accountID === 'a2')).toBe(false);
    expect(state.currentSessionID).toBe('s1');
  });

  it('removing an inactive account leaves the current session alone', () => {
    let state = signIn(loaded(), 'a1', 'u1', 's1', 1);
    state = signIn(state, 'a2', 'u2', 's2', 2);
    state = sessionReducer(state, {type: 'account-removed', accountID: 'a1', newSessionID: 'anon', now: t(3)});
    expect(state.currentSessionID).toBe('s2');
    expect(state.accounts.map(a => a.accountID)).toEqual(['a2']);
    expect(state.sessions.map(s => s.sessionID)).toEqual(['s2']);
  });

  it('removing the last account falls to an anonymous session on its server', () => {
    let state = signIn(loaded(), 'a1', 'u1', 's1', 1);
    state = sessionReducer(state, {type: 'account-removed', accountID: 'a1', newSessionID: 'anon', now: t(2)});
    expect(selectCurrentSession(state)).toMatchObject({sessionID: 'anon', accountID: null, serverUrl: SERVER});
    expect(state.accounts).toHaveLength(0);
  });

  it('switching orders accounts most recently used first', () => {
    let state = signIn(loaded(), 'a1', 'u1', 's1', 1);
    state = signIn(state, 'a2', 'u2', 's2', 2);
    state = signIn(state, 'a3', 'u3', 's3', 3);
    expect(state.accounts.map(a => a.accountID)).toEqual(['a3', 'a2', 'a1']);
    state = sessionReducer(state, {type: 'switched-to-session', sessionID: 's1', now: t(4)});
    expect(state.accounts.map(a => a.accountID)).toEqual(['a1', 'a3', 'a2']);
    expect(state.currentSessionID).toBe('s1');
    expect(state.sessions.find(s => s.sessionID === 's1')?.lastUsedAt).toBe(t(4));
  });

  it('ignores a stale account-revoked from a session that is no longer current', () => {
    let state = signIn(loaded(), 'a1', 'u1', 's1', 1);
    state = signIn(state, 'a2', 'u2', 's2', 2);
    const after = sessionReducer(state, {
      type: 'account-revoked',
      accountID: 'a1',
      sourceSessionID: 's1',
      newSessionID: 'anon',
      now: t(3),
    });
    expect(after).toBe(state);
    expect(after.tokens.a1).toBeDefined();
  });

  it('ignores stale account-updated and server-profile-updated actions', () => {
    let state = signIn(loaded(), 'a1', 'u1', 's1', 1);
    state = signIn(state, 'a2', 'u2', 's2', 2);
    expect(
      sessionReducer(state, {
        type: 'account-updated',
        accountID: 'a1',
        patch: {username: 'late'},
        sourceSessionID: 's1',
      }),
    ).toBe(state);
    expect(
      sessionReducer(state, {
        type: 'server-profile-updated',
        serverUrl: SERVER,
        patch: {cruiseLength: 9},
        sourceSessionID: 's1',
        now: t(3),
      }),
    ).toBe(state);
  });

  it('revoked clears the token only, keeping the row, and switches away', () => {
    let state = signIn(loaded(), 'a1', 'u1', 's1', 1);
    state = signIn(state, 'a2', 'u2', 's2', 2);
    state = sessionReducer(state, {
      type: 'account-revoked',
      accountID: 'a2',
      sourceSessionID: 's2',
      newSessionID: 'anon',
      now: t(3),
    });
    expect(state.accounts.find(a => a.accountID === 'a2')?.status).toBe('revoked');
    expect(state.tokens.a2).toBeUndefined();
    expect(state.tokens.a1).toBeDefined();
    expect(state.preferences.a2).toBeDefined();
    expect(state.sessions.some(s => s.accountID === 'a2')).toBe(true);
    expect(state.currentSessionID).toBe('s1');
  });

  it('applies a fresh account-updated for the current session', () => {
    let state = signIn(loaded(), 'a1', 'u1', 's1', 1);
    state = sessionReducer(state, {
      type: 'account-updated',
      accountID: 'a1',
      patch: {username: 'grant', accessLevel: UserAccessLevel.moderator},
      sourceSessionID: 's1',
    });
    expect(state.accounts[0]).toMatchObject({username: 'grant', accessLevel: UserAccessLevel.moderator});
  });

  it('switching to a server finds or creates its anonymous session', () => {
    let state = signIn(loaded(), 'a1', 'u1', 's1', 1);
    state = sessionReducer(state, {
      type: 'switched-to-server',
      serverUrl: OTHER_SERVER,
      newSessionID: 'srv',
      now: t(2),
    });
    expect(selectCurrentSession(state)).toMatchObject({sessionID: 'srv', accountID: null, serverUrl: OTHER_SERVER});
    state = sessionReducer(state, {type: 'switched-to-session', sessionID: 's1', now: t(3)});
    state = sessionReducer(state, {
      type: 'switched-to-server',
      serverUrl: OTHER_SERVER,
      newSessionID: 'srv-again',
      now: t(4),
    });
    expect(state.currentSessionID).toBe('srv');
    expect(state.sessions).toHaveLength(2);
  });

  it('keeps one session per server and account whatever the pre-registration mode', () => {
    let state = signIn(loaded(), 'a1', 'u1', 's1', 1);
    state = sessionReducer(state, {type: 'switched-to-server', serverUrl: SERVER, newSessionID: 'anon', now: t(2)});
    state = sessionReducer(state, {
      type: 'server-profile-updated',
      serverUrl: SERVER,
      patch: {preRegistrationMode: true},
      now: t(3),
    });
    state = sessionReducer(state, {type: 'switched-to-server', serverUrl: SERVER, newSessionID: 'anon-2', now: t(4)});
    state = sessionReducer(state, {type: 'switched-to-session', sessionID: 's1', now: t(5)});
    state = signIn(state, 'a1', 'u1', 's1-again', 6);
    expect(state.sessions.map(s => s.sessionID).sort()).toEqual(['anon', 's1']);
  });

  it('signing in from an anonymous session on the same server replaces it', () => {
    let state = sessionReducer(loaded(), {
      type: 'switched-to-server',
      serverUrl: SERVER,
      newSessionID: 'anon',
      now: t(1),
    });
    state = signIn(state, 'a1', 'u1', 's1', 2);
    expect(state.sessions.map(s => s.sessionID)).toEqual(['s1']);
    expect(state.currentSessionID).toBe('s1');
  });

  it('signing in again after signing out of the only account leaves no anonymous session', () => {
    let state = signIn(loaded(), 'a1', 'u1', 's1', 1);
    state = sessionReducer(state, {type: 'account-signed-out', accountID: 'a1', newSessionID: 'anon', now: t(2)});
    state = signIn(state, 'a-new', 'u1', 's-new', 3);
    expect(state.sessions.map(s => s.sessionID)).toEqual(['s1']);
  });

  it('signing in keeps anonymous sessions that are not current or are on another server', () => {
    let state = sessionReducer(loaded(), {
      type: 'switched-to-server',
      serverUrl: OTHER_SERVER,
      newSessionID: 'anon-other',
      now: t(1),
    });
    state = signIn(state, 'a1', 'u1', 's1', 2);
    expect(state.sessions.map(s => s.sessionID).sort()).toEqual(['anon-other', 's1']);

    state = sessionReducer(state, {type: 'switched-to-server', serverUrl: SERVER, newSessionID: 'anon', now: t(3)});
    state = sessionReducer(state, {type: 'switched-to-session', sessionID: 's1', now: t(4)});
    state = signIn(state, 'a2', 'u2', 's2', 5);
    expect(state.sessions.map(s => s.sessionID).sort()).toEqual(['anon', 'anon-other', 's1', 's2']);
  });

  it('removing the current anonymous session falls back to the most recently used one', () => {
    let state = signIn(loaded(), 'a1', 'u1', 's1', 1);
    state = sessionReducer(state, {
      type: 'switched-to-server',
      serverUrl: OTHER_SERVER,
      newSessionID: 'srv',
      now: t(2),
    });
    state = sessionReducer(state, {type: 'session-removed', sessionID: 'srv', now: t(3)});
    expect(state.currentSessionID).toBe('s1');
    expect(state.sessions.map(s => s.sessionID)).toEqual(['s1']);
  });

  it('removing the current anonymous session does not fall back to a signed-out account', () => {
    let state = signIn(loaded(), 'a1', 'u1', 's1', 1);
    state = signIn(state, 'a2', 'u2', 's2', 2);
    state = sessionReducer(state, {type: 'account-signed-out', accountID: 'a1', newSessionID: 'anon', now: t(3)});
    // s1 is now the most recently used session, but its account has no token.
    state = sessionReducer(state, {type: 'switched-to-session', sessionID: 's1', now: t(4)});
    state = sessionReducer(state, {
      type: 'switched-to-server',
      serverUrl: OTHER_SERVER,
      newSessionID: 'srv',
      now: t(5),
    });
    state = sessionReducer(state, {type: 'session-removed', sessionID: 'srv', now: t(6)});
    expect(state.currentSessionID).toBe('s2');
  });

  it('removing the last session leaves no current session', () => {
    let state = sessionReducer(loaded(), {
      type: 'switched-to-server',
      serverUrl: SERVER,
      newSessionID: 'anon',
      now: t(1),
    });
    state = sessionReducer(state, {type: 'session-removed', sessionID: 'anon', now: t(2)});
    expect(state.sessions).toHaveLength(0);
    expect(state.currentSessionID).toBeNull();
  });

  it('updates preferences for one account only', () => {
    let state = signIn(loaded(), 'a1', 'u1', 's1', 1);
    state = signIn(state, 'a2', 'u2', 's2', 2);
    state = sessionReducer(state, {type: 'preferences-updated', accountID: 'a1', patch: {markReadCancelPush: false}});
    expect(state.preferences.a1.markReadCancelPush).toBe(false);
    expect(state.preferences.a2.markReadCancelPush).toBe(true);
  });

  it('upserts server profiles', () => {
    let state = loaded();
    state = sessionReducer(state, {
      type: 'server-profile-updated',
      serverUrl: SERVER,
      patch: {cruiseLength: 8},
      now: t(1),
    });
    state = sessionReducer(state, {
      type: 'server-profile-updated',
      serverUrl: SERVER,
      patch: {portTimeZoneID: 'UTC'},
      now: t(2),
    });
    expect(state.serverProfiles).toHaveLength(1);
    expect(state.serverProfiles[0]).toMatchObject({cruiseLength: 8, portTimeZoneID: 'UTC', updatedAt: t(2)});
  });
});

describe('getAccountListEntries', () => {
  it('lists accounts and anonymous sessions together, oldest first', () => {
    let state = sessionReducer(loaded(), {
      type: 'switched-to-server',
      serverUrl: OTHER_SERVER,
      newSessionID: 'anon-other',
      now: t(1),
    });
    state = sessionReducer(state, {
      type: 'account-signed-in',
      account: {...makeAccount('a1', 'u1'), createdAt: t(2)},
      token: token('u1'),
      newSessionID: 's1',
      preferences: defaultAccountPreferences,
      now: t(2),
    });
    state = sessionReducer(state, {type: 'switched-to-server', serverUrl: SERVER, newSessionID: 'anon', now: t(3)});
    const entries = getAccountListEntries(state.accounts, state.sessions);
    expect(entries.map(e => `${e.kind}:${e.key}`)).toEqual(['anonymous:anon-other', 'account:a1', 'anonymous:anon']);
  });
});

describe('boarding', () => {
  const PREREG = 'https://start.twitarr.com';

  /**
   * A device in pre-registration: an anonymous session and a signed-in account on the
   * pre-registration server, plus an unrelated account on another server.
   */
  const preRegistered = (): SessionState => {
    let state = sessionReducer(loaded(), {
      type: 'switched-to-server',
      serverUrl: PREREG,
      newSessionID: 'pre-anon',
      now: t(1),
    });
    state = signIn(state, 'other', 'u9', 's-other', 2, OTHER_SERVER);
    state = sessionReducer(state, {
      type: 'account-signed-in',
      account: makeAccount('pre', 'u1', PREREG),
      token: token('u1'),
      newSessionID: 'pre-s',
      preferences: defaultAccountPreferences,
      now: t(3),
    });
    state = sessionReducer(state, {
      type: 'server-profile-updated',
      serverUrl: PREREG,
      patch: {cruiseLength: 7},
      now: t(4),
    });
    return sessionReducer(state, {type: 'preferences-updated', accountID: 'pre', patch: {markReadCancelPush: false}});
  };

  it('signing in deletes everything on the pre-registration server and carries its preferences over', () => {
    const before = preRegistered();
    const state = sessionReducer(before, {
      type: 'account-signed-in',
      account: makeAccount('ship', 'u2'),
      token: token('u2'),
      newSessionID: 'ship-s',
      preferences: defaultAccountPreferences,
      boardFromSessionID: 'pre-s',
      now: t(5),
    });
    expect(selectCurrentSession(state)).toMatchObject({sessionID: 'ship-s', serverUrl: SERVER, accountID: 'ship'});
    expect(state.accounts.map(a => a.accountID)).toEqual(['ship', 'other']);
    expect(state.sessions.map(s => s.sessionID).sort()).toEqual(['s-other', 'ship-s']);
    expect(state.tokens.pre).toBeUndefined();
    expect(state.preferences.pre).toBeUndefined();
    expect(state.serverProfiles.find(p => p.serverUrl === PREREG)).toBeUndefined();
    expect(state.preferences.ship).toBe(before.preferences.pre);
    expect(state.tokens.other).toEqual(token('u9'));
  });

  it('proceeding without an account also deletes the pre-registration server', () => {
    const state = sessionReducer(preRegistered(), {
      type: 'switched-to-server',
      serverUrl: SERVER,
      newSessionID: 'ship-anon',
      boardFromSessionID: 'pre-s',
      now: t(5),
    });
    expect(selectCurrentSession(state)).toMatchObject({sessionID: 'ship-anon', serverUrl: SERVER, accountID: null});
    expect(state.accounts.map(a => a.accountID)).toEqual(['other']);
    expect(state.sessions.some(s => s.serverUrl === PREREG)).toBe(false);
  });

  it('does not delete the server it is boarding onto', () => {
    const before = preRegistered();
    const state = sessionReducer(before, {
      type: 'account-signed-in',
      account: makeAccount('pre2', 'u3', PREREG),
      token: token('u3'),
      newSessionID: 'pre2-s',
      preferences: defaultAccountPreferences,
      boardFromSessionID: 'pre-s',
      now: t(5),
    });
    expect(state.accounts.map(a => a.accountID).sort()).toEqual(['other', 'pre', 'pre2']);
    expect(state.sessions).toHaveLength(before.sessions.length + 1);
  });

  it('removes the retired tokens, preferences and cache files from storage', async () => {
    mockAsyncStore.clear();
    mockSecureStore.clear();
    mockRemovedCacheKeys.length = 0;
    const store = new SessionStore();
    const seeded = preRegistered();
    store.dispatch({
      type: 'loaded',
      accounts: seeded.accounts,
      sessions: seeded.sessions,
      serverProfiles: seeded.serverProfiles,
      tokens: seeded.tokens,
      preferences: seeded.preferences,
      lastSessionID: seeded.currentSessionID,
    });
    // A load writes nothing, so put the seeded state on disk the way a previous run would have.
    await persistSessionState(null, store.getState());
    expect(mockSecureStore.has('ACCOUNT_TOKEN_V1_pre')).toBe(true);
    store.dispatch({
      type: 'account-signed-in',
      account: makeAccount('ship', 'u2'),
      token: token('u2'),
      newSessionID: 'ship-s',
      preferences: defaultAccountPreferences,
      boardFromSessionID: 'pre-s',
      now: t(5),
    });
    await store.flush();
    expect(mockSecureStore.has('ACCOUNT_TOKEN_V1_pre')).toBe(false);
    expect(mockAsyncStore.has('ACCOUNT_PREFS_V1_pre')).toBe(false);
    expect(mockSecureStore.has('ACCOUNT_TOKEN_V1_ship')).toBe(true);
    expect(mockRemovedCacheKeys.sort()).toEqual(['query-cache-pre-anon', 'query-cache-pre-s']);
    expect(mockSecureStore.get('LAST_SESSION_ID_V1')).toBe('ship-s');
  });
});

describe('session persistence', () => {
  beforeEach(() => {
    mockAsyncStore.clear();
    mockSecureStore.clear();
    mockRemovedCacheKeys.length = 0;
  });

  const seed = async () => {
    const store = new SessionStore();
    store.dispatch({
      type: 'loaded',
      accounts: [],
      sessions: [],
      serverProfiles: [],
      tokens: {},
      preferences: {},
      lastSessionID: null,
    });
    store.dispatch({
      type: 'account-signed-in',
      account: makeAccount('a1', 'u1'),
      token: token('u1'),
      newSessionID: 's1',
      preferences: defaultAccountPreferences,
      now: t(1),
    });
    store.dispatch({
      type: 'account-signed-in',
      account: makeAccount('a2', 'u2'),
      token: token('u2'),
      newSessionID: 's2',
      preferences: defaultAccountPreferences,
      now: t(2),
    });
    await store.flush();
    return store;
  };

  it('writes each token to its own key, plus the metadata and the last session pointer', async () => {
    await seed();
    expect(JSON.parse(mockSecureStore.get('ACCOUNT_TOKEN_V1_a1') ?? 'null')).toEqual(token('u1'));
    expect(JSON.parse(mockSecureStore.get('ACCOUNT_TOKEN_V1_a2') ?? 'null')).toEqual(token('u2'));
    expect(mockSecureStore.get('LAST_SESSION_ID_V1')).toBe('s2');
    const loadedBack = await SessionStorage.loadAll();
    expect(loadedBack?.accounts.map(a => a.accountID)).toEqual(['a2', 'a1']);
    expect(loadedBack?.sessions.map(s => s.sessionID)).toEqual(['s1', 's2']);
    expect(Object.keys(loadedBack?.tokens ?? {}).sort()).toEqual(['a1', 'a2']);
    expect(Object.keys(loadedBack?.preferences ?? {}).sort()).toEqual(['a1', 'a2']);
  });

  it('removing an account deletes its token, prefs and cache file', async () => {
    const store = await seed();
    store.dispatch({type: 'account-removed', accountID: 'a1', newSessionID: 'anon', now: t(3)});
    await store.flush();
    expect(mockSecureStore.has('ACCOUNT_TOKEN_V1_a1')).toBe(false);
    expect(mockAsyncStore.has('ACCOUNT_PREFS_V1_a1')).toBe(false);
    expect(mockRemovedCacheKeys).toEqual(['query-cache-s1']);
    expect(mockSecureStore.has('ACCOUNT_TOKEN_V1_a2')).toBe(true);
  });

  it('signing out deletes the token and clears the cache but keeps the account row', async () => {
    const store = await seed();
    store.dispatch({type: 'account-signed-out', accountID: 'a1', newSessionID: 'anon', now: t(3)});
    await store.flush();
    expect(mockSecureStore.has('ACCOUNT_TOKEN_V1_a1')).toBe(false);
    expect(mockRemovedCacheKeys).toEqual(['query-cache-s1']);
    const loadedBack = await SessionStorage.loadAll();
    expect(loadedBack?.accounts.find(a => a.accountID === 'a1')?.status).toBe('signedOut');
    expect(loadedBack?.preferences.a1).toBeDefined();
  });

  it('writes nothing for an ignored action', async () => {
    const store = await seed();
    const before = new Map(mockAsyncStore);
    store.dispatch({
      type: 'account-revoked',
      accountID: 'a1',
      sourceSessionID: 's1',
      newSessionID: 'anon',
      now: t(3),
    });
    await store.flush();
    expect(mockAsyncStore).toEqual(before);
    expect(mockSecureStore.has('ACCOUNT_TOKEN_V1_a1')).toBe(true);
  });

  it('persistSessionState with no previous state writes everything', async () => {
    const state = signIn(loaded(), 'a1', 'u1', 's1', 1);
    await persistSessionState(null, state);
    expect(mockAsyncStore.get('ACCOUNTS_V1')).toBeDefined();
    expect(mockAsyncStore.get('SESSIONS_V2')).toBeDefined();
    expect(mockSecureStore.get('ACCOUNT_TOKEN_V1_a1')).toBeDefined();
  });
});

describe('config split', () => {
  const {defaultAppConfig, mergeAppConfig, splitAppConfig} = jest.requireActual('#src/Libraries/AppConfig');

  it('merging the split of the default config reproduces it', () => {
    const {device, preferences, server} = splitAppConfig(defaultAppConfig);
    const merged = mergeAppConfig(device, preferences, server);
    expect(JSON.parse(JSON.stringify(merged))).toEqual(JSON.parse(JSON.stringify(defaultAppConfig)));
  });

  it('keeps enableLateDayFlip device-wide and out of account preferences', () => {
    const {device, preferences} = splitAppConfig({
      ...defaultAppConfig,
      schedule: {...defaultAppConfig.schedule, enableLateDayFlip: false},
    });
    expect(device.enableLateDayFlip).toBe(false);
    expect(preferences.schedule).not.toHaveProperty('enableLateDayFlip');
  });

  it('a sparse server profile does not blank out defaults', () => {
    const {device, preferences} = splitAppConfig(defaultAppConfig);
    const merged = mergeAppConfig(device, preferences, {cruiseLength: 5, schedBaseUrl: undefined});
    expect(merged.cruiseLength).toBe(5);
    expect(merged.portTimeZoneID).toBe(defaultAppConfig.portTimeZoneID);
    expect(merged.schedBaseUrl).toBe(defaultAppConfig.schedBaseUrl);
  });
});

describe('merge with a server profile', () => {
  const {defaultAppConfig, mergeAppConfig, splitAppConfig} = jest.requireActual('#src/Libraries/AppConfig');

  it("exposes the server's canonical hostnames from its profile", () => {
    const {device, preferences} = splitAppConfig(defaultAppConfig);
    expect(mergeAppConfig(device, preferences).canonicalHostnames).toEqual(['twitarr.com']);
    const merged = mergeAppConfig(device, preferences, {canonicalHostnames: ['twitarr.com', 'joco.example']});
    expect(merged.canonicalHostnames).toEqual(['twitarr.com', 'joco.example']);
  });

  it("does not let the profile's serverUrl replace the device's default server", () => {
    const {device, preferences} = splitAppConfig(defaultAppConfig);
    const merged = mergeAppConfig(device, preferences, {
      serverUrl: 'https://start.twitarr.com',
      cruiseLength: 5,
      updatedAt: 'x',
    });
    expect(merged.serverUrl).toBe(defaultAppConfig.serverUrl);
    expect(merged.cruiseLength).toBe(5);
  });
});
