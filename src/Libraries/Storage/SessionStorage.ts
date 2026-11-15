import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import {LoadedSessionData} from '#src/Context/State/SessionState';
import {AccountPreferences, reviveAccountPreferences} from '#src/Libraries/AppConfig';
import {createLogger} from '#src/Libraries/Logger';
import {AccountStorageKeys, StorageKeys} from '#src/Libraries/Storage';
import {TokenStringData} from '#src/Structs/ControllerStructs';
import {Account, ServerProfile, Session} from '#src/Structs/SessionStructs';

const logger = createLogger('SessionStorage.ts');

/**
 * Read a JSON array from AsyncStorage. A missing or corrupt value is an empty list.
 */
const readList = async <T>(key: string): Promise<T[]> => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? (JSON.parse(data) as T[]) : [];
  } catch (error) {
    logger.error('Error reading', key, error);
    return [];
  }
};

/**
 * Storage namespace for accounts, sessions and server profiles. Tokens are one SecureStore value
 * per account; the rest is small metadata in AsyncStorage. Readable from headless code (background
 * workers) because nothing here touches React.
 */
export namespace SessionStorage {
  export const getAccounts = (): Promise<Account[]> => readList<Account>(StorageKeys.ACCOUNTS);

  export const getSessions = (): Promise<Session[]> => readList<Session>(StorageKeys.SESSIONS);

  export const getServerProfiles = (): Promise<ServerProfile[]> => readList<ServerProfile>(StorageKeys.SERVER_PROFILES);

  /**
   * Whether the account-model storage exists yet. False on a fresh install or before the migration.
   */
  export const hasSessionsV2 = async (): Promise<boolean> =>
    (await AsyncStorage.getItem(StorageKeys.SESSIONS)) !== null;

  /**
   * Token for an account, or null if it is signed out or has none.
   */
  export const getTokenForAccount = async (accountID: string): Promise<TokenStringData | null> => {
    try {
      const data = await SecureStore.getItemAsync(AccountStorageKeys.token(accountID));
      return data ? (JSON.parse(data) as TokenStringData) : null;
    } catch (error) {
      logger.error('Error loading token for account', accountID, error);
      return null;
    }
  };

  /**
   * The account's swiftarr_session webview cookie value, if one was captured at login.
   */
  export const getCookieForAccount = async (accountID: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(AccountStorageKeys.cookie(accountID));
    } catch (error) {
      logger.error('Error loading cookie for account', accountID, error);
      return null;
    }
  };

  export const setCookieForAccount = async (accountID: string, value: string): Promise<void> => {
    await SecureStore.setItemAsync(AccountStorageKeys.cookie(accountID), value);
  };

  /**
   * Stored preferences for an account, filled in with defaults for anything newer than the stored copy.
   */
  export const getAccountPreferences = async (accountID: string): Promise<AccountPreferences | null> => {
    try {
      const data = await AsyncStorage.getItem(AccountStorageKeys.preferences(accountID));
      return data ? reviveAccountPreferences(JSON.parse(data)) : null;
    } catch (error) {
      logger.error('Error loading preferences for account', accountID, error);
      return null;
    }
  };

  /**
   * Load the whole account model. Null when none has been written yet (migration time).
   */
  export const loadAll = async (): Promise<LoadedSessionData | null> => {
    if (!(await hasSessionsV2())) {
      return null;
    }
    const [accounts, sessions, serverProfiles, lastSessionID] = await Promise.all([
      getAccounts(),
      getSessions(),
      getServerProfiles(),
      getLastSessionID(),
    ]);
    const tokens: LoadedSessionData['tokens'] = {};
    const preferences: LoadedSessionData['preferences'] = {};
    await Promise.all(
      accounts.map(async account => {
        const [token, prefs] = await Promise.all([
          getTokenForAccount(account.accountID),
          getAccountPreferences(account.accountID),
        ]);
        if (token) {
          tokens[account.accountID] = token;
        }
        if (prefs) {
          preferences[account.accountID] = prefs;
        }
      }),
    );
    return {accounts, sessions, serverProfiles, tokens, preferences, lastSessionID};
  };

  /**
   * Get the last active session ID.
   */
  export const getLastSessionID = async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(StorageKeys.LAST_SESSION_ID);
    } catch (error) {
      logger.error('Error loading last session ID:', error);
      return null;
    }
  };

  /**
   * Set the last active session ID.
   * SecureStore rejects empty values, so an empty ID deletes the key instead.
   */
  export const setLastSessionID = async (sessionID: string): Promise<void> => {
    if (!sessionID) {
      await SecureStore.deleteItemAsync(StorageKeys.LAST_SESSION_ID);
      return;
    }
    await SecureStore.setItemAsync(StorageKeys.LAST_SESSION_ID, sessionID);
  };

  /**
   * Get the current session by looking up the last active session ID.
   * Useful for background workers that cannot access React context.
   */
  export const getCurrentSession = async (): Promise<Session | null> => {
    const lastSessionID = await getLastSessionID();
    if (!lastSessionID) {
      return null;
    }
    const sessions = await getSessions();
    return sessions.find(s => s.sessionID === lastSessionID) ?? null;
  };

  /**
   * The account the current session belongs to, or null for an anonymous session.
   */
  export const getCurrentAccount = async (): Promise<Account | null> => {
    const session = await getCurrentSession();
    if (!session?.accountID) {
      return null;
    }
    const accounts = await getAccounts();
    return accounts.find(a => a.accountID === session.accountID) ?? null;
  };

  /**
   * Device-wide OOBE completion (APP_OOBE_COMPLETED_VERSION_V1). 0 if never completed.
   */
  export const getOobeCompletedVersion = async (): Promise<number> => {
    const raw = await AsyncStorage.getItem(StorageKeys.OOBE_COMPLETED_VERSION);
    const parsed = raw ? Number(raw) : 0;
    return Number.isFinite(parsed) ? parsed : 0;
  };

  export const setOobeCompletedVersion = async (version: number): Promise<void> => {
    await AsyncStorage.setItem(StorageKeys.OOBE_COMPLETED_VERSION, String(version));
  };

  /**
   * Pre-account-model sessions, for the migration only.
   */
  export const getLegacySessions = async (): Promise<unknown[]> => {
    try {
      const data = await SecureStore.getItemAsync(StorageKeys.LEGACY_SESSIONS_DATA);
      return data ? (JSON.parse(data) as unknown[]) : [];
    } catch (error) {
      logger.error('Error loading legacy sessions:', error);
      return [];
    }
  };

  /**
   * Pre-split AppConfig blob (APP_CONFIG_V2), for the migration only.
   */
  export const getLegacyConfig = (): Promise<string | null> => AsyncStorage.getItem(StorageKeys.LEGACY_APP_CONFIG);
}
