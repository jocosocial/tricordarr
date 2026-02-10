import EncryptedStorage from 'react-native-encrypted-storage';

import {createLogger} from '#src/Libraries/Logger';
import {StorageKeys} from '#src/Libraries/Storage';
import {Session} from '#src/Structs/SessionStructs';

const logger = createLogger('SessionStorage.ts');

/**
 * Storage namespace for managing sessions in EncryptedStorage.
 * All operations persist immediately to ensure data integrity.
 */
export namespace SessionStorage {
  /**
   * Retrieve all sessions from storage.
   */
  export const getAll = async (): Promise<Session[]> => {
    try {
      const data = await EncryptedStorage.getItem(StorageKeys.SESSIONS_DATA);
      if (!data) {
        return [];
      }
      return JSON.parse(data) as Session[];
    } catch (error) {
      logger.error('Error loading sessions:', error);
      return [];
    }
  };

  /**
   * Get a specific session by ID.
   */
  export const get = async (sessionID: string): Promise<Session | null> => {
    const sessions = await getAll();
    return sessions.find(s => s.sessionID === sessionID) || null;
  };

  /**
   * Save or update a session. If a session with the same ID exists, it will be updated.
   */
  export const save = async (session: Session): Promise<void> => {
    const sessions = await getAll();
    const existingIndex = sessions.findIndex(s => s.sessionID === session.sessionID);

    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }

    await EncryptedStorage.setItem(StorageKeys.SESSIONS_DATA, JSON.stringify(sessions));
  };

  /**
   * Delete a session by ID.
   */
  export const deleteSession = async (sessionID: string): Promise<void> => {
    const sessions = await getAll();
    const filtered = sessions.filter(s => s.sessionID !== sessionID);
    await EncryptedStorage.setItem(StorageKeys.SESSIONS_DATA, JSON.stringify(filtered));
  };

  /**
   * Get the last active session ID.
   */
  export const getLastSessionID = async (): Promise<string | null> => {
    try {
      return await EncryptedStorage.getItem(StorageKeys.LAST_SESSION_ID);
    } catch (error) {
      logger.error('Error loading last session ID:', error);
      return null;
    }
  };

  /**
   * Set the last active session ID.
   */
  export const setLastSessionID = async (sessionID: string): Promise<void> => {
    await EncryptedStorage.setItem(StorageKeys.LAST_SESSION_ID, sessionID);
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
    return await get(lastSessionID);
  };
}
