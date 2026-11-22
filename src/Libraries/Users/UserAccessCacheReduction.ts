import {UserAccessLevel} from '#src/Enums/UserAccessLevel';
import {UserRoleType} from '#src/Enums/UserRoleType';
import {CurrentUserData, UserHeader} from '#src/Structs/ControllerStructs';

/** Compare by Unicode code points. Matches Swift's `$0.username < $1.username`. */
export const usernameComparator = (a: UserHeader, b: UserHeader): number => {
  if (a.username < b.username) return -1;
  if (a.username > b.username) return 1;
  return 0;
};

/**
 * Insert a UserHeader into a sorted array by username. Returns a new array.
 * If the header is already present (by userID), returns unchanged array.
 */
export function insertSortedByUsername(arr: UserHeader[] | undefined, header: UserHeader): UserHeader[] {
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
export function removeByUserID(arr: UserHeader[] | undefined, userID: string): UserHeader[] | undefined {
  if (!arr) return arr;
  const next = arr.filter(h => h.userID !== userID);
  return next.length === arr.length ? arr : next;
}

/**
 * Grant or revoke a role on the current user's whoami data. Returns the same object when the role
 * is already in the requested state.
 */
export function withRole(data: CurrentUserData, role: UserRoleType, granted: boolean): CurrentUserData {
  const hasRole = data.roles.includes(role);
  if (hasRole === granted) {
    return data;
  }
  const roles = granted ? [...data.roles, role] : data.roles.filter(r => r !== role);
  return {...data, roles};
}

/**
 * Set the access level on anything that carries one. Returns the same object when it already matches.
 */
export function withAccessLevel<T extends {accessLevel: UserAccessLevel}>(data: T, accessLevel: UserAccessLevel): T {
  return data.accessLevel === accessLevel ? data : {...data, accessLevel};
}

/**
 * Membership of one access-level list (`/admin/moderators` etc.) after a user's level changes. A user
 * is in exactly the list for their level, so they leave every other list. A list that hasn't loaded
 * stays unloaded rather than becoming a list of one.
 */
export function withAccessLevelMembership(
  arr: UserHeader[] | undefined,
  header: UserHeader,
  isListForLevel: boolean,
): UserHeader[] | undefined {
  if (!arr) {
    return arr;
  }
  return isListForLevel ? insertSortedByUsername(arr, header) : removeByUserID(arr, header.userID);
}
