import {LoadedSessionData} from '#src/Context/State/SessionState';
import {SessionStorage} from '#src/Libraries/Storage/SessionStorage';

const EMPTY: LoadedSessionData = {
  accounts: [],
  sessions: [],
  serverProfiles: [],
  tokens: {},
  preferences: {},
  lastSessionID: null,
};

/**
 * Read the account model from storage, or an empty one when none has been written yet. Storage
 * from before the account model is not read; such a device starts fresh and runs setup.
 */
export const loadSessionData = async (): Promise<LoadedSessionData> => (await SessionStorage.loadAll()) ?? EMPTY;
