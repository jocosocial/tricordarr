import {v4 as uuidv4} from 'uuid';

import {LoadedSessionData} from '#src/Context/State/SessionState';
import {createLogger} from '#src/Libraries/Logger';
import {LegacySession, migrateLegacySessions} from '#src/Libraries/Storage/SessionMigration';
import {SessionStorage} from '#src/Libraries/Storage/SessionStorage';

const logger = createLogger('SessionLoader.ts');

const EMPTY: LoadedSessionData = {
  accounts: [],
  sessions: [],
  serverProfiles: [],
  tokens: {},
  preferences: {},
  lastSessionID: null,
};

/**
 * Read the account model from storage, running the one-time migration from the pre-account
 * SESSIONS_DATA_V1 / APP_CONFIG_V2 storage if the new keys do not exist yet. `persist` tells the
 * store that what it is being handed (the migrated result) is not yet on disk in the new shape.
 *
 * Also carries the device-level OOBE version across: it used to live on each session.
 */
export const loadSessionData = async (): Promise<{data: LoadedSessionData; persist: boolean}> => {
  const existing = await SessionStorage.loadAll();
  if (existing) {
    return {data: existing, persist: false};
  }
  const legacySessions = (await SessionStorage.getLegacySessions()) as LegacySession[];
  if (legacySessions.length === 0) {
    return {data: EMPTY, persist: false};
  }
  logger.info('Migrating', legacySessions.length, 'legacy sessions to the account model.');
  const {oobeCompletedVersion, ...data} = migrateLegacySessions({
    legacySessions,
    lastSessionID: await SessionStorage.getLastSessionID(),
    legacyConfig: await SessionStorage.getLegacyConfig(),
    newID: uuidv4,
    now: new Date().toISOString(),
  });
  if ((await SessionStorage.getOobeCompletedVersion()) < oobeCompletedVersion) {
    await SessionStorage.setOobeCompletedVersion(oobeCompletedVersion);
  }
  return {data, persist: true};
};
