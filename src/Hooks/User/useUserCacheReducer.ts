import {useQueryClient} from '@tanstack/react-query';
import {useCallback} from 'react';

import {getRelationListQueryKey, type UserRelationMode} from '#src/Queries/Users/UserRelationConstants';
import {UserHeader} from '#src/Structs/ControllerStructs';

/** Compare by username (alphabetical, case-insensitive). Matches API sort order. */
const usernameComparator = (a: UserHeader, b: UserHeader): number =>
  a.username.localeCompare(b.username, undefined, {sensitivity: 'base'});

/**
 * Insert a UserHeader into a sorted array by username. Returns a new array.
 * If the header is already present (by userID), returns unchanged array.
 */
function insertSortedByUsername(arr: UserHeader[] | undefined, header: UserHeader): UserHeader[] {
  if (!arr) {
    return [header];
  }
  if (arr.some(h => h.userID === header.userID)) {
    return arr;
  }
  const index = arr.findIndex(h => usernameComparator(header, h) <= 0);
  const insertAt = index === -1 ? arr.length : index;
  return [...arr.slice(0, insertAt), header, ...arr.slice(insertAt)];
}

/**
 * Remove a user (by userID) from an array. Returns a new array.
 */
function removeByUserID(arr: UserHeader[] | undefined, userID: string): UserHeader[] | undefined {
  if (!arr) return arr;
  const next = arr.filter(h => h.userID !== userID);
  return next.length === arr.length ? arr : next;
}

/**
 * Hook that exposes discrete actions for updating React Query caches for user
 * relation lists (favorites, mutes, blocks). Each action uses setQueriesData
 * and returns new arrays so React Query detects changes. Lists are kept
 * sorted alphabetically by username to match the API.
 */
export const useUserCacheReducer = () => {
  const queryClient = useQueryClient();

  const addToRelationList = useCallback(
    (mode: UserRelationMode, header: UserHeader) => {
      const queryKey = getRelationListQueryKey(mode);
      queryClient.setQueriesData<UserHeader[]>({queryKey}, oldData => insertSortedByUsername(oldData, header));
    },
    [queryClient],
  );

  const removeFromRelationList = useCallback(
    (mode: UserRelationMode, userID: string) => {
      const queryKey = getRelationListQueryKey(mode);
      queryClient.setQueriesData<UserHeader[]>({queryKey}, oldData => removeByUserID(oldData, userID));
    },
    [queryClient],
  );

  const addFavorite = useCallback((header: UserHeader) => addToRelationList('favorite', header), [addToRelationList]);
  const removeFavorite = useCallback(
    (header: UserHeader) => removeFromRelationList('favorite', header.userID),
    [removeFromRelationList],
  );
  const addMute = useCallback((header: UserHeader) => addToRelationList('mute', header), [addToRelationList]);
  const removeMute = useCallback(
    (header: UserHeader) => removeFromRelationList('mute', header.userID),
    [removeFromRelationList],
  );
  const addBlock = useCallback((header: UserHeader) => addToRelationList('block', header), [addToRelationList]);
  const removeBlock = useCallback(
    (header: UserHeader) => removeFromRelationList('block', header.userID),
    [removeFromRelationList],
  );

  const removeRelation = useCallback(
    (mode: UserRelationMode, header: UserHeader) => removeFromRelationList(mode, header.userID),
    [removeFromRelationList],
  );

  return {
    addFavorite,
    removeFavorite,
    addMute,
    removeMute,
    addBlock,
    removeBlock,
    addRelation: addToRelationList,
    removeRelation,
  };
};
