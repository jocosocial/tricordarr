jest.mock('#src/Libraries/Logger', () => ({
  createLogger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

import {getBadgeDisplayValue} from '#src/Libraries/StringUtils';
import {UserNotificationData} from '#src/Structs/ControllerStructs';

const notificationData = (overrides: Partial<UserNotificationData>): UserNotificationData =>
  ({
    addedToSeamailCount: 0,
    addedToLFGCount: 0,
    addedToPrivateEventCount: 0,
    newFezMessageCount: 0,
    newPrivateEventMessageCount: 0,
    alertWords: [],
    ...overrides,
  }) as UserNotificationData;

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
