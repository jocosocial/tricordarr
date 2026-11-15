import {isAccountPreRegistration} from '#src/Libraries/Account';
import {AccountPreferences, DeviceConfig, getDeviceConfig, mergeAppConfig} from '#src/Libraries/AppConfig';
import {SessionStorage} from '#src/Libraries/Storage/SessionStorage';
import {Account, ServerProfile} from '#src/Structs/SessionStructs';

/**
 * An account the native background service connects for, as accepted by
 * `NativeTricordarrModule.syncPushAccounts` on both platforms. `accountID` is the
 * `Account.accountID`; native treats it as an opaque key.
 */
export interface PushAccount {
  accountID: string;
  userID: string;
  username: string;
  serverUrl: string;
  urlPrefix: string;
  token: string;
  enabled: boolean;
  prefs: {
    pushNotifications: Record<string, boolean>;
    muteNotificationsUntil?: number;
  };
  /** The networks the account's server is on. iOS only runs its extension while joined to one. */
  wifiNetworkNames: string[];
}

/**
 * Everything `selectPushAccounts` decides from, already read out of storage.
 */
export interface PushAccountInputs {
  deviceConfig: DeviceConfig;
  oobeCompletedVersion: number;
  accounts: Account[];
  serverProfiles: ServerProfile[];
  /** The account of the current session, or null when it is anonymous or there is none. */
  activeAccountID: string | null;
  /** Bearer tokens by accountID. An account with no entry is skipped. */
  tokens: Record<string, string | undefined>;
  /** Stored preferences by accountID. An account with none uses the device defaults. */
  preferences: Record<string, AccountPreferences | undefined>;
}

/**
 * The account of the current session, for addressing its notifications on the native side.
 * Reads storage so it works outside React.
 */
export const getCurrentPushAccountID = async (): Promise<string | undefined> => {
  const session = await SessionStorage.getCurrentSession();
  return session?.accountID ?? undefined;
};

/**
 * Decide which accounts get a background notification socket. The active account always does;
 * any other signed-in account does only if it opted in with `backgroundNotifications`. Nothing
 * does until setup is complete or while the background worker is switched off, and never an
 * account on a server in pre-registration mode.
 */
export const selectPushAccounts = (inputs: PushAccountInputs): PushAccount[] => {
  const {deviceConfig, oobeCompletedVersion, accounts, serverProfiles, activeAccountID, tokens, preferences} = inputs;
  if (!deviceConfig.enableBackgroundWorker || oobeCompletedVersion < deviceConfig.oobeExpectedVersion) {
    return [];
  }
  const pushAccounts: PushAccount[] = [];
  for (const account of accounts) {
    const token = tokens[account.accountID];
    const prefs = preferences[account.accountID] ?? deviceConfig.defaultPreferences;
    const profile = serverProfiles.find(p => p.serverUrl === account.serverUrl);
    const isActive = account.accountID === activeAccountID;
    if (account.status !== 'signedIn' || !token || isAccountPreRegistration(account, serverProfiles)) {
      continue;
    }
    if (!isActive && !prefs.backgroundNotifications) {
      continue;
    }
    pushAccounts.push({
      accountID: account.accountID,
      userID: account.userID,
      username: account.username,
      serverUrl: account.serverUrl,
      urlPrefix: deviceConfig.urlPrefix,
      token,
      enabled: deviceConfig.enableNotificationSocket,
      prefs: {
        pushNotifications: {...prefs.pushNotifications},
        muteNotificationsUntil: prefs.muteNotifications ? new Date(prefs.muteNotifications).getTime() : undefined,
      },
      // The effective config supplies the same defaults the settings screen shows.
      wifiNetworkNames: [...mergeAppConfig(deviceConfig, prefs, profile).wifiNetworkNames],
    });
  }
  return pushAccounts;
};

/**
 * The accounts the background service should hold sockets for, read from storage so it works
 * outside React.
 */
export const buildPushAccounts = async (): Promise<PushAccount[]> => {
  const [deviceConfig, oobeCompletedVersion, accounts, serverProfiles, session] = await Promise.all([
    getDeviceConfig(),
    SessionStorage.getOobeCompletedVersion(),
    SessionStorage.getAccounts(),
    SessionStorage.getServerProfiles(),
    SessionStorage.getCurrentSession(),
  ]);
  const tokens: PushAccountInputs['tokens'] = {};
  const preferences: PushAccountInputs['preferences'] = {};
  await Promise.all(
    accounts.map(async account => {
      const [token, prefs] = await Promise.all([
        SessionStorage.getTokenForAccount(account.accountID),
        SessionStorage.getAccountPreferences(account.accountID),
      ]);
      tokens[account.accountID] = token?.token;
      preferences[account.accountID] = prefs ?? undefined;
    }),
  );
  return selectPushAccounts({
    deviceConfig,
    oobeCompletedVersion,
    accounts,
    serverProfiles,
    activeAccountID: session?.accountID ?? null,
    tokens,
    preferences,
  });
};
