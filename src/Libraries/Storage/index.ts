/**
 * Consistent place for tracking storage key locations.
 * This is also a lazy way out of handling user upgrades from year to year.
 * I don't want to write migrations for AppConfig.
 * https://github.com/jocosocial/tricordarr/issues/145
 */
export const StorageKeys = {
  APP_CONFIG: 'APP_CONFIG_V2',
  TOKEN_STRING_DATA_V2: 'TOKEN_STRING_DATA_V2',
  PREREGISTRATION_TOKEN_STRING_DATA: 'PREREGISTRATION_TOKEN_STRING_DATA',
  TOKEN_STORAGE_DATA: 'TOKEN_STORAGE_DATA_V2',
  WS_HEALTHCHECK_DATA: 'WS_HEALTHCHECK_DATA_V2',
  OOBE_VERSION: 'OOBE_VERSION_V2',
  FGS_START: 'FGS_START_V2',
  SESSIONS_DATA: 'SESSIONS_DATA_V1',
  LAST_SESSION_ID: 'LAST_SESSION_ID_V1',
} as const;
