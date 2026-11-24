import {isUserInFez} from '#src/Libraries/FezMembership';
import {FezData} from '#src/Structs/ControllerStructs';

const makeFez = (participants: string[], waitingList: string[] = [], hasMembers = true): FezData =>
  ({
    fezID: 'fez',
    members: hasMembers
      ? {
          participants: participants.map(userID => ({userID})),
          waitingList: waitingList.map(userID => ({userID})),
        }
      : undefined,
  }) as unknown as FezData;

describe('isUserInFez', () => {
  it('is true for a participant', () => {
    expect(isUserInFez(makeFez(['me', 'other']), 'me')).toBe(true);
  });

  it('is true for someone on the waiting list', () => {
    expect(isUserInFez(makeFez(['other'], ['me']), 'me')).toBe(true);
  });

  it('is false for a moderator who can see members but has not joined', () => {
    expect(isUserInFez(makeFez(['other']), 'me')).toBe(false);
  });

  it('is false without members data or a user', () => {
    expect(isUserInFez(makeFez([], [], false), 'me')).toBe(false);
    expect(isUserInFez(makeFez(['me']), undefined)).toBe(false);
  });
});
