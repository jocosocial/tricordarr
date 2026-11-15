import {LoadedSessionData} from '#src/Context/State/SessionState';
import {
  AccountPreferences,
  AppConfig,
  defaultAppConfig,
  parseLegacyAppConfig,
  pickAccountPreferences,
  pickServerProfileFields,
} from '#src/Libraries/AppConfig';
import {createLogger} from '#src/Libraries/Logger';
import {normalizeServerUrl} from '#src/Libraries/ServerUrl';
import {TokenStringData} from '#src/Structs/ControllerStructs';
import {Account, ServerProfile, Session} from '#src/Structs/SessionStructs';

const logger = createLogger('SessionMigration.ts');

/**
 * A session as SESSIONS_DATA_V1 stored it: a (serverUrl, preRegistrationMode) slot with the
 * token and OOBE state inline.
 */
export interface LegacySession {
  sessionID: string;
  serverUrl: string;
  preRegistrationMode: boolean;
  tokenData: TokenStringData | null;
  createdAt: string;
  lastUsedAt: string;
  oobeCompletedVersion?: number;
}

export interface MigrationResult extends LoadedSessionData {
  /** The current legacy session's OOBE version, destined for the device-level OOBE key. */
  oobeCompletedVersion: number;
}

/**
 * One-time conversion of the pre-account-model storage into accounts, sessions and server profiles:
 *
 * 1. Each legacy session with a token becomes an Account (deduped on server+user, username left
 *    empty until the first whoami) plus a Session pointing at it; without a token it becomes an
 *    anonymous Session.
 * 2. The user fields of the legacy AppConfig become the preferences of every migrated account, the
 *    server fields become a ServerProfile per distinct server.
 * 3. The current session's OOBE version becomes the device's.
 * 4. Legacy session IDs are kept, so existing query-cache files keep working, and
 *    LAST_SESSION_ID keeps pointing at the same session.
 *
 * Pure: ids and time arrive as arguments. Old keys are not touched.
 */
export const migrateLegacySessions = ({
  legacySessions,
  lastSessionID,
  legacyConfig,
  newID,
  now,
}: {
  legacySessions: LegacySession[];
  lastSessionID: string | null;
  legacyConfig: string | null;
  newID: () => string;
  now: string;
}): MigrationResult => {
  let config: AppConfig = defaultAppConfig;
  if (legacyConfig) {
    try {
      config = parseLegacyAppConfig(legacyConfig);
    } catch (error) {
      logger.error('Unable to parse legacy AppConfig, migrating with defaults:', error);
    }
  }
  const preferences: AccountPreferences = pickAccountPreferences(config);
  const serverFields = pickServerProfileFields(config);

  // The current session goes first so its ID survives any dedupe; then most recent first so the
  // freshest token wins when two legacy sessions map to the same account.
  const ordered = [...legacySessions].sort((a, b) => {
    if (a.sessionID === lastSessionID) return -1;
    if (b.sessionID === lastSessionID) return 1;
    return b.lastUsedAt.localeCompare(a.lastUsedAt);
  });

  const accounts: Account[] = [];
  const sessions: Session[] = [];
  const tokens: LoadedSessionData['tokens'] = {};
  const prefsByAccount: LoadedSessionData['preferences'] = {};
  const legacyPreRegistration: Record<string, boolean> = {};

  for (const legacy of ordered) {
    const serverUrl = normalizeServerUrl(legacy.serverUrl);
    let accountID: string | null = null;
    if (legacy.tokenData) {
      let account = accounts.find(a => a.serverUrl === serverUrl && a.userID === legacy.tokenData?.userID);
      if (!account) {
        account = {
          accountID: newID(),
          serverUrl,
          userID: legacy.tokenData.userID,
          username: '',
          accessLevel: legacy.tokenData.accessLevel,
          status: 'signedIn',
          createdAt: legacy.createdAt,
          lastUsedAt: legacy.lastUsedAt,
        };
        accounts.push(account);
        tokens[account.accountID] = legacy.tokenData;
        prefsByAccount[account.accountID] = preferences;
      }
      accountID = account.accountID;
    }
    // Pre-registration mode used to be per session. It is the server's now; the first legacy
    // session seen for a server (the current one, else the most recent) speaks for it.
    if (!(serverUrl in legacyPreRegistration)) {
      legacyPreRegistration[serverUrl] = legacy.preRegistrationMode;
    }
    const duplicate = sessions.some(s => s.serverUrl === serverUrl && s.accountID === accountID);
    if (duplicate) {
      continue;
    }
    sessions.push({
      sessionID: legacy.sessionID,
      serverUrl,
      accountID,
      createdAt: legacy.createdAt,
      lastUsedAt: legacy.lastUsedAt,
    });
  }

  accounts.sort((a, b) => b.lastUsedAt.localeCompare(a.lastUsedAt));

  // Pre-registration turned off on the pre-registration server can only have been the user's own
  // doing (the banner's hidden disable), so it is kept as an override. Anything else is taken as
  // what the server reports, which the next /client/settings fetch confirms or corrects.
  // Older legacy configs predate preRegistrationServerUrl.
  const preRegistrationServerUrl = normalizeServerUrl(
    config.preRegistrationServerUrl ?? defaultAppConfig.preRegistrationServerUrl,
  );
  const serverProfiles: ServerProfile[] = [...new Set(sessions.map(s => s.serverUrl))].map(serverUrl => ({
    serverUrl,
    ...serverFields,
    preRegistrationMode: legacyPreRegistration[serverUrl],
    ...(serverUrl === preRegistrationServerUrl && !legacyPreRegistration[serverUrl]
      ? {preRegistrationOverride: false}
      : undefined),
    updatedAt: now,
  }));

  const current = legacySessions.find(s => s.sessionID === lastSessionID);
  const oobeCompletedVersion =
    current?.oobeCompletedVersion ?? Math.max(0, ...legacySessions.map(s => s.oobeCompletedVersion ?? 0));

  return {
    accounts,
    sessions,
    serverProfiles,
    tokens,
    preferences: prefsByAccount,
    lastSessionID: sessions.some(s => s.sessionID === lastSessionID) ? lastSessionID : null,
    oobeCompletedVersion,
  };
};
