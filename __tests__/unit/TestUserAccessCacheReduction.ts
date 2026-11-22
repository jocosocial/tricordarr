import {UserAccessLevel} from '#src/Enums/UserAccessLevel';
import {UserRoleType} from '#src/Enums/UserRoleType';
import {
  insertSortedByUsername,
  removeByUserID,
  withAccessLevel,
  withAccessLevelMembership,
  withRole,
} from '#src/Libraries/Users/UserAccessCacheReduction';
import {AdminAccessLevelListData} from '#src/Structs/AdminControllerStructs';
import {CurrentUserData, UserHeader} from '#src/Structs/ControllerStructs';

const header = (username: string): UserHeader => ({userID: `id-${username}`, username});

const whoami = (roles: UserRoleType[]): CurrentUserData => ({
  userID: 'id-me',
  username: 'me',
  isLoggedIn: true,
  accessLevel: UserAccessLevel.verified,
  roles,
});

describe('insertSortedByUsername', () => {
  it('inserts in username order', () => {
    const result = insertSortedByUsername([header('alice'), header('carol')], header('bob'));
    expect(result.map(h => h.username)).toEqual(['alice', 'bob', 'carol']);
  });

  it('returns the same array when the user is already present', () => {
    const list = [header('alice')];
    expect(insertSortedByUsername(list, header('alice'))).toBe(list);
  });
});

describe('removeByUserID', () => {
  it('removes the user', () => {
    const result = removeByUserID([header('alice'), header('bob')], 'id-alice');
    expect(result?.map(h => h.username)).toEqual(['bob']);
  });

  it('returns the same array when the user is absent', () => {
    const list = [header('alice')];
    expect(removeByUserID(list, 'id-bob')).toBe(list);
  });
});

describe('withRole', () => {
  it('grants a role', () => {
    expect(withRole(whoami([]), UserRoleType.shutternaut, true).roles).toEqual([UserRoleType.shutternaut]);
  });

  it('revokes a role', () => {
    const data = whoami([UserRoleType.shutternaut, UserRoleType.karaokemanager]);
    expect(withRole(data, UserRoleType.shutternaut, false).roles).toEqual([UserRoleType.karaokemanager]);
  });

  it('returns the same object when nothing changes', () => {
    const data = whoami([UserRoleType.shutternaut]);
    expect(withRole(data, UserRoleType.shutternaut, true)).toBe(data);
    expect(withRole(data, UserRoleType.karaokemanager, false)).toBe(data);
  });
});

describe('withAccessLevel', () => {
  it('sets a new level and keeps the same object when unchanged', () => {
    const data = whoami([]);
    expect(withAccessLevel(data, UserAccessLevel.moderator).accessLevel).toBe(UserAccessLevel.moderator);
    expect(withAccessLevel(data, UserAccessLevel.verified)).toBe(data);
  });
});

describe('withAccessLevelMembership', () => {
  /** Apply a level change to every listed level, as the reducer does. */
  const applyLevel = (lists: Record<string, UserHeader[]>, user: UserHeader, level: UserAccessLevel) =>
    Object.fromEntries(
      AdminAccessLevelListData.listedLevels.map(listLevel => [
        listLevel,
        withAccessLevelMembership(lists[listLevel], user, listLevel === level),
      ]),
    );

  const bob = header('bob');
  const lists = {
    [UserAccessLevel.moderator]: [header('alice'), bob],
    [UserAccessLevel.twitarrteam]: [header('carol')],
    [UserAccessLevel.tho]: [],
  };

  it('moves a promoted user between lists', () => {
    const result = applyLevel(lists, bob, UserAccessLevel.twitarrteam);
    expect(result[UserAccessLevel.moderator]?.map(h => h.username)).toEqual(['alice']);
    expect(result[UserAccessLevel.twitarrteam]?.map(h => h.username)).toEqual(['bob', 'carol']);
    expect(result[UserAccessLevel.tho]).toEqual([]);
  });

  it('leaves a demoted user in no list', () => {
    const result = applyLevel(lists, bob, UserAccessLevel.verified);
    const everyone = Object.values(result).flatMap(list => list ?? []);
    expect(everyone.some(h => h.userID === bob.userID)).toBe(false);
  });

  it('does not create a list that has not loaded', () => {
    expect(withAccessLevelMembership(undefined, bob, true)).toBeUndefined();
  });
});
