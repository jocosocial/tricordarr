jest.mock('#src/Libraries/Logger', () => ({
  createLogger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useRoute: jest.fn(),
}));

jest.mock('@react-navigation/stack', () => ({
  StackNavigationProp: {},
}));

import {FezType} from '#src/Enums/FezType';
import {getBadgeDisplayValue} from '#src/Libraries/StringUtils';
import {FezData, UserNotificationData} from '#src/Structs/ControllerStructs';

const notificationData = (overrides: Partial<UserNotificationData>): UserNotificationData =>
  ({
    addedToSeamailCount: 0,
    addedToSeamailIDs: [],
    addedToLFGCount: 0,
    addedToLFGIDs: [],
    addedToPrivateEventCount: 0,
    addedToPrivateEventIDs: [],
    newFezMessageCount: 0,
    newPrivateEventMessageCount: 0,
    alertWords: [],
    ...overrides,
  }) as UserNotificationData;

const fezData = (overrides: Partial<FezData>): FezData =>
  ({
    fezID: 'fez-1',
    fezType: FezType.open,
    ...overrides,
  }) as FezData;

describe('UserNotificationData.totalNewSeamail', () => {
  it('returns 0 when notification data is missing', () => {
    expect(UserNotificationData.totalNewSeamail(undefined)).toBe(0);
  });

  it('includes addedToSeamailCount in the seamail total used by the tab badge', () => {
    const data = notificationData({
      newSeamailMessageCount: 2,
      addedToSeamailCount: 3,
    });
    expect(UserNotificationData.totalNewSeamail(data)).toBe(5);
  });

  it('shows a badge when the user was only added to seamails', () => {
    const data = notificationData({
      newSeamailMessageCount: 0,
      addedToSeamailCount: 1,
    });
    expect(getBadgeDisplayValue(UserNotificationData.totalNewSeamail(data))).toBe(1);
  });

  it('hides the badge when there are no new messages and no added-to seamails', () => {
    const data = notificationData({
      newSeamailMessageCount: 0,
      addedToSeamailCount: 0,
    });
    expect(getBadgeDisplayValue(UserNotificationData.totalNewSeamail(data))).toBeUndefined();
  });
});

describe('UserNotificationData.isAddedTo', () => {
  it('returns false when notification data is missing', () => {
    expect(UserNotificationData.isAddedTo(undefined, fezData({}))).toBe(false);
  });

  it('matches a seamail fez against addedToSeamailIDs', () => {
    const data = notificationData({addedToSeamailIDs: ['fez-1']});
    expect(UserNotificationData.isAddedTo(data, fezData({fezType: FezType.closed, fezID: 'fez-1'}))).toBe(true);
    expect(UserNotificationData.isAddedTo(data, fezData({fezType: FezType.closed, fezID: 'fez-2'}))).toBe(false);
  });

  it('matches an LFG fez against addedToLFGIDs', () => {
    const data = notificationData({addedToLFGIDs: ['fez-1']});
    expect(UserNotificationData.isAddedTo(data, fezData({fezType: FezType.gaming, fezID: 'fez-1'}))).toBe(true);
  });

  it('matches a private event fez against addedToPrivateEventIDs', () => {
    const data = notificationData({addedToPrivateEventIDs: ['fez-1']});
    expect(UserNotificationData.isAddedTo(data, fezData({fezType: FezType.privateEvent, fezID: 'fez-1'}))).toBe(true);
  });
});
