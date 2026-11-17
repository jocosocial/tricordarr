jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {getItem: jest.fn(async () => null), setItem: jest.fn(), removeItem: jest.fn()},
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('#src/Libraries/Storage/QueryCacheStorage', () => ({
  getQueryCacheKey: (sessionID: string) => `query-cache-${sessionID}`,
  queryCacheStorage: {removeItem: jest.fn()},
}));

jest.mock('#src/Libraries/Logger', () => ({
  createLogger: () => ({debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn()}),
}));

import {UserAccessLevel} from '#src/Enums/UserAccessLevel';
import {defaultAccountPreferences, defaultDeviceConfig} from '#src/Libraries/AppConfig';
import {
  clearAccountLink,
  consumeAccountLink,
  getLinkAccountID,
  isOtherAccountLink,
  PENDING_LINK_TTL_MS,
  stashAccountLink,
  stashServerLink,
  stripLinkAccount,
} from '#src/Libraries/Notifications/AccountLink';
import {cruiseEndMs, PushAccountInputs, selectPushAccounts} from '#src/Libraries/Notifications/Push/PushAccounts';
import {Account, ServerProfile} from '#src/Structs/SessionStructs';

const SERVER = 'https://twitarr.com';
const PREREG = 'https://prereg.twitarr.com';

const makeAccount = (id: string, overrides: Partial<Account> = {}): Account => ({
  accountID: id,
  serverUrl: SERVER,
  userID: `user-${id}`,
  username: `name-${id}`,
  accessLevel: UserAccessLevel.verified,
  status: 'signedIn',
  createdAt: '2026-01-01T00:00:00.000Z',
  lastUsedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

const makeProfile = (serverUrl: string, preRegistrationMode: boolean): ServerProfile => ({
  serverUrl,
  preRegistrationMode,
  wifiNetworkNames: [],
  dismissMinAccessWarning: false,
  updatedAt: '2026-01-01T00:00:00.000Z',
});

const optedOut = {...defaultAccountPreferences, backgroundNotifications: false};

const makeInputs = (overrides: Partial<PushAccountInputs> = {}): PushAccountInputs => ({
  deviceConfig: defaultDeviceConfig,
  oobeCompletedVersion: defaultDeviceConfig.oobeExpectedVersion,
  accounts: [makeAccount('a'), makeAccount('b')],
  serverProfiles: [makeProfile(SERVER, false), makeProfile(PREREG, true)],
  activeAccountID: 'a',
  tokens: {a: 'token-a', b: 'token-b'},
  preferences: {},
  ...overrides,
});

const ids = (inputs: PushAccountInputs) => selectPushAccounts(inputs).map(account => account.accountID);

describe('selectPushAccounts', () => {
  it('serves inactive accounts too by default', () => {
    expect(ids(makeInputs())).toEqual(['a', 'b']);
  });

  it('skips an inactive account that opted out', () => {
    expect(ids(makeInputs({preferences: {b: optedOut}}))).toEqual(['a']);
  });

  it('keeps serving accounts while the active session is anonymous', () => {
    expect(ids(makeInputs({activeAccountID: null}))).toEqual(['a', 'b']);
  });

  it('skips every account that opted out while the active session is anonymous', () => {
    expect(ids(makeInputs({activeAccountID: null, preferences: {a: optedOut, b: optedOut}}))).toEqual([]);
  });

  it('skips accounts that are signed out, revoked, or have no token', () => {
    const inputs = makeInputs({
      accounts: [
        makeAccount('a', {status: 'signedOut'}),
        makeAccount('b', {status: 'revoked'}),
        makeAccount('c'),
        makeAccount('d'),
      ],
      tokens: {a: 'token-a', b: 'token-b', d: 'token-d'},
    });
    expect(ids(inputs)).toEqual(['d']);
  });

  it('skips accounts on a server in pre-registration mode, even the active one', () => {
    const inputs = makeInputs({
      accounts: [makeAccount('a', {serverUrl: PREREG}), makeAccount('b')],
      preferences: {b: optedOut},
    });
    expect(ids(inputs)).toEqual([]);
  });

  describe('autoStartUntil', () => {
    const cruiseProfile = (): ServerProfile => ({
      ...makeProfile(SERVER, false),
      cruiseStartDateStr: '2026-03-01',
      cruiseLength: 8,
      portTimeZoneID: 'America/New_York',
    });
    // Eight days from midnight, 1 March in New York (EST until 8 March, EDT after).
    const cruiseEnd = Date.UTC(2026, 2, 9, 4, 0, 0);

    it('is the end of the cruise in the port timezone', () => {
      expect(cruiseEndMs(cruiseProfile())).toBe(cruiseEnd);
    });

    it('is unknown until the server settings have been mirrored', () => {
      expect(cruiseEndMs(makeProfile(SERVER, false))).toBeUndefined();
      expect(cruiseEndMs(undefined)).toBeUndefined();
    });

    it('limits an account to the end of its server cruise', () => {
      const [a] = selectPushAccounts(makeInputs({serverProfiles: [cruiseProfile()]}));
      expect(a.autoStartUntil).toBe(cruiseEnd);
    });

    it('is dropped for every account when the device keeps running after the cruise', () => {
      const deviceConfig = {...defaultDeviceConfig, keepRunningAfterCruise: true};
      const accounts = selectPushAccounts(makeInputs({deviceConfig, serverProfiles: [cruiseProfile()]}));
      expect(accounts).toHaveLength(2);
      accounts.forEach(account => expect(account.autoStartUntil).toBeUndefined());
    });
  });

  it('serves nothing until setup is complete', () => {
    expect(ids(makeInputs({oobeCompletedVersion: 0}))).toEqual([]);
  });

  it('serves nothing while the background worker is switched off', () => {
    const deviceConfig = {...defaultDeviceConfig, enableBackgroundWorker: false};
    expect(ids(makeInputs({deviceConfig}))).toEqual([]);
  });

  it('gives each account the networks of its own server', () => {
    const beta = 'https://beta.twitarr.com';
    const inputs = makeInputs({
      accounts: [makeAccount('a'), makeAccount('b', {serverUrl: beta})],
      serverProfiles: [
        {...makeProfile(SERVER, false), wifiNetworkNames: ['ShipWifi']},
        {...makeProfile(beta, false), wifiNetworkNames: ['BetaWifi', 'BetaGuest']},
      ],
    });
    const [a, b] = selectPushAccounts(inputs);
    expect(a.wifiNetworkNames).toEqual(['ShipWifi']);
    expect(b.wifiNetworkNames).toEqual(['BetaWifi', 'BetaGuest']);
  });

  it('gives each account its own identity, token and preferences', () => {
    const mutedUntil = new Date('2026-03-01T12:00:00.000Z');
    const inputs = makeInputs({
      accounts: [makeAccount('a'), makeAccount('b', {serverUrl: 'https://beta.twitarr.com'})],
      serverProfiles: [],
      preferences: {
        b: {
          ...defaultAccountPreferences,
          muteNotifications: mutedUntil,
          pushNotifications: {...defaultAccountPreferences.pushNotifications, seamailUnreadMsg: false},
        },
      },
    });
    const [a, b] = selectPushAccounts(inputs);
    expect(a).toMatchObject({accountID: 'a', username: 'name-a', serverUrl: SERVER, token: 'token-a'});
    expect(a.prefs.muteNotificationsUntil).toBeUndefined();
    expect(a.prefs.pushNotifications.seamailUnreadMsg).toBe(true);
    expect(b).toMatchObject({accountID: 'b', serverUrl: 'https://beta.twitarr.com', token: 'token-b'});
    expect(b.urlPrefix).toBe(defaultDeviceConfig.urlPrefix);
    expect(b.prefs.muteNotificationsUntil).toBe(mutedUntil.getTime());
    expect(b.prefs.pushNotifications.seamailUnreadMsg).toBe(false);
  });
});

describe('account links', () => {
  it('reads the account a link is addressed to', () => {
    expect(getLinkAccountID('tricordarr://seamail/123?account=abc-123')).toBe('abc-123');
    expect(getLinkAccountID('tricordarr://settings/pushnotifications?notificationType=x&account=a%20b')).toBe('a b');
    expect(getLinkAccountID('tricordarr://seamail/123')).toBeUndefined();
    expect(getLinkAccountID('tricordarr://seamail/123?myaccount=abc')).toBeUndefined();
  });

  it('strips the account and keeps the other parameters', () => {
    expect(stripLinkAccount('tricordarr://seamail/123?account=abc')).toBe('tricordarr://seamail/123');
    expect(stripLinkAccount('seamail/123?account=abc&x=1')).toBe('seamail/123?x=1');
    expect(stripLinkAccount('seamail/123?x=1&account=abc')).toBe('seamail/123?x=1');
    expect(stripLinkAccount('seamail/123?x=1&account=abc&y=2')).toBe('seamail/123?x=1&y=2');
    expect(stripLinkAccount('seamail/123?x=1')).toBe('seamail/123?x=1');
  });

  it('only treats a link naming a different account as belonging elsewhere', () => {
    expect(isOtherAccountLink('tricordarr://home', 'a')).toBe(false);
    expect(isOtherAccountLink('tricordarr://home?account=a', 'a')).toBe(false);
    expect(isOtherAccountLink('tricordarr://home?account=b', 'a')).toBe(true);
    expect(isOtherAccountLink('tricordarr://home?account=b', null)).toBe(true);
  });

  it('hands a held link to its account once', () => {
    stashAccountLink('b', 'tricordarr://seamail/123');
    expect(consumeAccountLink({accountID: 'b'})).toBe('tricordarr://seamail/123');
    expect(consumeAccountLink({accountID: 'b'})).toBeUndefined();
  });

  it('drops a held link when a different account becomes active', () => {
    stashAccountLink('b', 'tricordarr://seamail/123');
    expect(consumeAccountLink({accountID: 'a'})).toBeUndefined();
    expect(consumeAccountLink({accountID: 'b'})).toBeUndefined();
  });

  it('forgets a held link when the switch does not happen', () => {
    stashAccountLink('b', 'tricordarr://seamail/123');
    clearAccountLink();
    expect(consumeAccountLink({accountID: 'b'})).toBeUndefined();
  });

  it('hands a server link to any session on that server, once', () => {
    stashServerLink('https://start.twitarr.com/', 'tricordarr://forums');
    expect(consumeAccountLink({accountID: null, serverUrl: 'https://start.twitarr.com'})).toBe('tricordarr://forums');
    expect(consumeAccountLink({accountID: null, serverUrl: 'https://start.twitarr.com'})).toBeUndefined();
  });

  it('drops a server link when a session on another server becomes active', () => {
    stashServerLink('https://start.twitarr.com', 'tricordarr://forums');
    expect(consumeAccountLink({accountID: 'a', serverUrl: 'https://twitarr.com'})).toBeUndefined();
    expect(consumeAccountLink({accountID: 'b', serverUrl: 'https://start.twitarr.com'})).toBeUndefined();
  });

  it('does not hand a server link to an account link request without a server', () => {
    stashServerLink('https://start.twitarr.com', 'tricordarr://forums');
    expect(consumeAccountLink({accountID: 'a'})).toBeUndefined();
  });

  it('lets a held link expire', () => {
    const now = jest.spyOn(Date, 'now');
    now.mockReturnValue(1_000);
    stashServerLink('https://start.twitarr.com', 'tricordarr://forums');
    now.mockReturnValue(1_000 + PENDING_LINK_TTL_MS + 1);
    expect(consumeAccountLink({serverUrl: 'https://start.twitarr.com'})).toBeUndefined();
    now.mockReturnValue(1_000);
    stashAccountLink('b', 'tricordarr://seamail/123');
    now.mockReturnValue(1_000 + PENDING_LINK_TTL_MS + 1);
    expect(consumeAccountLink({accountID: 'b'})).toBeUndefined();
    now.mockRestore();
  });
});
