import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import {SessionState} from '#src/Context/State/SessionState';
import {createLogger} from '#src/Libraries/Logger';
import {AccountStorageKeys, StorageKeys} from '#src/Libraries/Storage';
import {getQueryCacheKey, queryCacheStorage} from '#src/Libraries/Storage/QueryCacheStorage';
import {SessionStorage} from '#src/Libraries/Storage/SessionStorage';

const logger = createLogger('SessionPersistence.ts');

const EMPTY_STATE: SessionState = {
  accounts: [],
  sessions: [],
  serverProfiles: [],
  tokens: {},
  preferences: {},
  currentSessionID: null,
  isLoading: false,
};

/**
 * Write whatever changed between two states to storage. Each piece lives in its own key, so one
 * dispatch touches only the keys that changed: a token write is one small SecureStore value, not
 * a rewrite of every account. Comparison is by reference, which the reducer's copy-on-write
 * makes exact.
 *
 * Also owns the cleanup that must follow state changes: deleting a removed session's cache file,
 * and clearing the cache of an account that just signed out or was revoked so a signed-out user's
 * data does not stay on disk.
 *
 * `prev` null writes everything, as when seeding storage from a whole state.
 */
export const persistSessionState = async (prev: SessionState | null, next: SessionState): Promise<void> => {
  const before = prev ?? EMPTY_STATE;
  const writes: Promise<unknown>[] = [];

  if (!prev || before.accounts !== next.accounts) {
    writes.push(AsyncStorage.setItem(StorageKeys.ACCOUNTS, JSON.stringify(next.accounts)));
  }
  if (!prev || before.sessions !== next.sessions) {
    writes.push(AsyncStorage.setItem(StorageKeys.SESSIONS, JSON.stringify(next.sessions)));
  }
  if (!prev || before.serverProfiles !== next.serverProfiles) {
    writes.push(AsyncStorage.setItem(StorageKeys.SERVER_PROFILES, JSON.stringify(next.serverProfiles)));
  }
  if (!prev || before.currentSessionID !== next.currentSessionID) {
    writes.push(SessionStorage.setLastSessionID(next.currentSessionID ?? ''));
  }

  for (const [accountID, token] of Object.entries(next.tokens)) {
    if (before.tokens[accountID] !== token) {
      writes.push(SecureStore.setItemAsync(AccountStorageKeys.token(accountID), JSON.stringify(token)));
    }
  }
  for (const accountID of Object.keys(before.tokens)) {
    if (!(accountID in next.tokens)) {
      writes.push(SecureStore.deleteItemAsync(AccountStorageKeys.token(accountID)));
      // The webview cookie is the same credential under another name; it goes with the token.
      writes.push(SecureStore.deleteItemAsync(AccountStorageKeys.cookie(accountID)));
    }
  }

  for (const [accountID, prefs] of Object.entries(next.preferences)) {
    if (before.preferences[accountID] !== prefs) {
      writes.push(AsyncStorage.setItem(AccountStorageKeys.preferences(accountID), JSON.stringify(prefs)));
    }
  }
  for (const accountID of Object.keys(before.preferences)) {
    if (!(accountID in next.preferences)) {
      writes.push(AsyncStorage.removeItem(AccountStorageKeys.preferences(accountID)));
    }
  }

  // Cache files. A session that disappeared loses its file, and so does every session of an
  // account that just left 'signedIn'.
  const nextSessionIDs = new Set(next.sessions.map(s => s.sessionID));
  const cacheToDelete = new Set<string>();
  for (const session of before.sessions) {
    if (!nextSessionIDs.has(session.sessionID)) {
      cacheToDelete.add(session.sessionID);
    }
  }
  for (const account of next.accounts) {
    const was = before.accounts.find(a => a.accountID === account.accountID);
    if (was && was.status === 'signedIn' && account.status !== 'signedIn') {
      next.sessions.filter(s => s.accountID === account.accountID).forEach(s => cacheToDelete.add(s.sessionID));
    }
  }
  cacheToDelete.forEach(sessionID => {
    try {
      queryCacheStorage.removeItem(getQueryCacheKey(sessionID));
    } catch (error) {
      logger.error('Failed to delete query cache for session', sessionID, error);
    }
  });

  await Promise.all(writes);
};
