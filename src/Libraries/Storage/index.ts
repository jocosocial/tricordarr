/**
 * Consistent place for tracking storage key locations.
 * This is also a lazy way out of handling user upgrades from year to year.
 * I don't want to write migrations for AppConfig.
 * https://github.com/jocosocial/tricordarr/issues/145
 */
export const StorageKeys = {
  // Device-wide config.
  APP_CONFIG: 'APP_CONFIG_V3',
  WS_HEALTHCHECK_DATA: 'WS_HEALTHCHECK_DATA_V3',
  FGS_START: 'FGS_START_V2',
  ACCOUNTS: 'ACCOUNTS_V1',
  SESSIONS: 'SESSIONS_V2',
  SERVER_PROFILES: 'SERVER_PROFILES_V1',
  OOBE_COMPLETED_VERSION: 'APP_OOBE_COMPLETED_VERSION_V1',
  LAST_SESSION_ID: 'LAST_SESSION_ID_V1',
} as const;

/**
 * Per-account storage keys: a token in SecureStore, preferences in AsyncStorage.
 */
export const AccountStorageKeys = {
  token: (accountID: string) => `ACCOUNT_TOKEN_V1_${accountID}`,
  preferences: (accountID: string) => `ACCOUNT_PREFS_V1_${accountID}`,
  // Raw swiftarr_session webview cookie value, so it can be put back when switching to the account.
  cookie: (accountID: string) => `ACCOUNT_COOKIE_V1_${accountID}`,
} as const;
