import EncryptedStorage from 'react-native-encrypted-storage';

import {StorageKeys} from '#src/Libraries/Storage';
import {TokenStringData} from '#src/Structs/ControllerStructs';

export type TokenStorageData = TokenStringData[];

/**
 * This is not in use. Likely started as some evening project and forgotten about.
 *
 * Android (by default) will clear the token storage on app uninstall. iOS will not.
 * We have extra code in `AppDelegate.swift` to clear the keychain on first launch
 * after reinstall.
 *
 * https://github.com/emeraldsanto/react-native-encrypted-storage?tab=readme-ov-file#note-regarding-keychain-persistence
 */
export namespace TokenStorageData {
  /**
   * Retrieve the local token storage array.
   */
  export const getLocal = async () => {
    const raw = await EncryptedStorage.getItem(StorageKeys.TOKEN_STORAGE_DATA);
    if (raw) {
      return JSON.parse(raw) as TokenStorageData;
    }
    return [];
  };

  /**
   * Set the local token storage array.
   * @param data TokenStorageData to save
   */
  export const setLocal = async (data: TokenStorageData) => {
    await EncryptedStorage.setItem(StorageKeys.TOKEN_STORAGE_DATA, JSON.stringify(data));
  };

  /**
   * Clear the local token storage array.
   */
  export const clearLocal = async () => {
    await EncryptedStorage.removeItem(StorageKeys.TOKEN_STORAGE_DATA);
  };

  /**
   * Locate the TokenStringData for a given userID.
   * @param userID
   */
  export const find = async (userID: string) => {
    const data = await getLocal();
    return data?.find(tsd => tsd.userID === userID);
  };

  /**
   * Insert or Update an existing set of TokenStringData.
   * @param data TokenStringData to insert/update with
   */
  export const upsertToken = async (data: TokenStringData) => {
    const storage = await getLocal();
    const index = storage?.findIndex(tsd => tsd.userID === data.userID);

    if (index === -1) {
      storage.push(data); // Add new entry if userID doesn't exist
    } else {
      // @TODO this could be dangerous with collisions
      storage[index] = data; // Update token for existing userID
    }
  };

  /**
   * Remove an existing token.
   * @param userID user ID of the token to remove
   */
  export const removeToken = async (userID: string) => {
    const storage = await getLocal();
    const index = storage.findIndex(tsd => tsd.userID === userID);

    if (index !== -1) {
      storage.splice(index, 1); // Remove entry if userID exists
    }
  };
}
