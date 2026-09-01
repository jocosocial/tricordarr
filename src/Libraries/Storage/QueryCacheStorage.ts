import {File, Paths} from 'expo-file-system';

import {createLogger} from '#src/Libraries/Logger';

const logger = createLogger('QueryCacheStorage.ts');

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
   */
  setItem: (key: string, value: string): void => {
    const file = getCacheFile(key);
    const tmp = getTempFile(key);
    deleteIfExists(tmp);
    tmp.create();
    tmp.write(value);
    tmp.moveSync(file, {overwrite: true});
    logger.debug('Wrote query cache', file.name, file.size);
  },

  /**
   * Remove the persisted cache for `key` and any leftover temp file.
   */
  removeItem: (key: string): void => {
    deleteIfExists(getCacheFile(key));
    deleteIfExists(getTempFile(key));
  },
};
