import {useQueryClient} from '@tanstack/react-query';
import {useCallback} from 'react';

import {UserAccessLevel} from '#src/Enums/UserAccessLevel';
import {UserRoleType} from '#src/Enums/UserRoleType';
import {
  insertSortedByUsername,
  removeByUserID,
  withAccessLevel,
  withAccessLevelMembership,
  withRole,
} from '#src/Libraries/Users/UserAccessCacheReduction';
import {USER_WHOAMI_ENDPOINT} from '#src/Queries/User/UserQueries';
import {getRelationListQueryKey, type UserRelationMode} from '#src/Queries/Users/UserRelationConstants';
import {AdminAccessLevelListData, AdminUserRoleListData} from '#src/Structs/AdminControllerStructs';
import {CurrentUserData, UserHeader, UserModerationData} from '#src/Structs/ControllerStructs';

/**
 * Hook that exposes discrete actions for updating React Query caches for user
 * relation lists (favorites, mutes, blocks), role membership and access levels.
 * Each action uses setQueriesData and returns new arrays so React Query detects
 * changes. Lists are kept sorted alphabetically by username to match the API.
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

  /**
   * Apply an edit to the whoami cache only when `userID` is the current user, so a change made to
   * your own account reaches RoleProvider and the session's access level.
   */
  const updateSelf = useCallback(
    (userID: string, updater: (data: CurrentUserData) => CurrentUserData) => {
      queryClient.setQueriesData<CurrentUserData>({queryKey: [USER_WHOAMI_ENDPOINT]}, oldData =>
        oldData && oldData.userID === userID ? updater(oldData) : oldData,
      );
    },
    [queryClient],
  );

  /**
   * Record that a user was given or lost a role: the role's member lists, and your own roles if it was you.
   */
  const setRole = useCallback(
    (role: UserRoleType, header: UserHeader, granted: boolean) => {
      for (const queryKey of AdminUserRoleListData.getCacheKeys(role)) {
        queryClient.setQueriesData<UserHeader[]>({queryKey}, oldData => {
          if (!oldData) {
            return oldData;
          }
          return granted ? insertSortedByUsername(oldData, header) : removeByUserID(oldData, header.userID);
        });
      }
      updateSelf(header.userID, data => withRole(data, role, granted));
    },
    [queryClient, updateSelf],
  );

  const grantRole = useCallback((role: UserRoleType, header: UserHeader) => setRole(role, header, true), [setRole]);
  const revokeRole = useCallback((role: UserRoleType, header: UserHeader) => setRole(role, header, false), [setRole]);

  /**
   * Record a user's new access level: THO's per-level lists, the moderation view of the user, and
   * your own access level if it was you.
   */
  const setAccessLevel = useCallback(
    (header: UserHeader, accessLevel: UserAccessLevel) => {
      for (const listLevel of AdminAccessLevelListData.listedLevels) {
        const queryKey = AdminAccessLevelListData.getCacheKeyForLevel(listLevel);
        if (!queryKey) {
          continue;
        }
        queryClient.setQueriesData<UserHeader[]>({queryKey}, oldData =>
          withAccessLevelMembership(oldData, header, listLevel === accessLevel),
        );
      }
      queryClient.setQueriesData<UserModerationData>(
        {queryKey: UserModerationData.getDetailCacheKey(header.userID)},
        oldData => (oldData ? withAccessLevel(oldData, accessLevel) : oldData),
      );
      updateSelf(header.userID, data => withAccessLevel(data, accessLevel));
    },
    [queryClient, updateSelf],
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
    grantRole,
    revokeRole,
    setAccessLevel,
  };
};
