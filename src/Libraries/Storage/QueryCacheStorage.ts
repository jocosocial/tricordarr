import {File, Paths} from 'expo-file-system';

import {createLogger} from '#src/Libraries/Logger';

const logger = createLogger('QueryCacheStorage.ts');

/**
 * Persister key (and file basename) of a session's query cache.
 */
export const getQueryCacheKey = (sessionID: string) => `query-cache-${sessionID}`;

/**
 * Resolve the cache file for a persister key. Lives in the documents directory
 * so the OS cannot evict it.
 */
const getCacheFile = (key: string) => new File(Paths.document, `${key}.json`);

/**
 * Sibling temp file used for atomic replacement of the cache file.
 */
const getTempFile = (key: string) => new File(Paths.document, `${key}.json.tmp`);

/**
 * Delete a file if it exists. expo-file-system throws if the file is missing.
 */
const deleteIfExists = (file: File) => {
  if (file.exists) {
    file.delete();
  }
};

/**
 * File-backed storage adapter for the React Query persister.
 * Avoids Android AsyncStorage's ~2MB CursorWindow per-row limit.
 */
export const queryCacheStorage = {
  /**
   * Read the persisted cache for `key`, or null if it does not exist.
   */
  getItem: async (key: string): Promise<string | null> => {
    const file = getCacheFile(key);
    if (!file.exists) {
      return null;
    }
    return await file.text();
  },

  /**
   * Persist `value` for `key` via a temp file then move, so a mid-write
   * kill cannot leave truncated JSON.
   *
   * `File.write` is asynchronous (expo-file-system 58+) and creates or truncates
   * the file itself, so the write must be awaited before the move. Moving while
   * the write is still in flight races the native write: the cache file ends up
   * empty and the write can reject with "it already exists". Returning the promise
   * also lets the persister's throttle serialize writes.
   */
  setItem: async (key: string, value: string): Promise<void> => {
    const file = getCacheFile(key);
    const tmp = getTempFile(key);
    try {
      await tmp.write(value);
      await tmp.move(file, {overwrite: true});
      logger.debug('Wrote query cache', file.name, file.size);
    } catch (error) {
      logger.error('Failed to write query cache', file.name, error);
      throw error;
    }
  },

  /**
   * Remove the persisted cache for `key` and any leftover temp file.
   */
  removeItem: (key: string): void => {
    deleteIfExists(getCacheFile(key));
    deleteIfExists(getTempFile(key));
  },
};
