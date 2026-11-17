jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {getItem: jest.fn(async () => null), setItem: jest.fn(), removeItem: jest.fn()},
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('#src/Libraries/Storage/QueryCacheStorage', () => ({
  getQueryCacheKey: (sessionID: string) => `query-cache-${sessionID}`,
  queryCacheStorage: {removeItem: jest.fn()},
}));

jest.mock('#src/Libraries/Logger', () => ({
  createLogger: () => ({debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn()}),
}));

jest.mock('#specs/NativeTricordarrModule', () => ({}));

import {contentNotificationSections} from '#src/Libraries/Notifications/Content';
import {NotificationTypeData} from '#src/Structs/SocketStructs';

// The push notification settings screen is built from specs/NotificationEvents.json. These check
// that every type lands in the section its spec says, so a spec change cannot quietly regroup them.

describe('contentNotificationSections', () => {
  const sectionOf = (type: string) =>
    contentNotificationSections.find(section => section.categories.some(c => c.configKey === type))?.title;

  it('lists each posted type under its channel', () => {
    Object.entries(NotificationTypeData.specs)
      .filter(([, spec]) => spec.channel && !spec.signal)
      .forEach(([type, spec]) =>
        expect([type, sectionOf(type)]).toEqual([type, NotificationTypeData.channelNames[spec.channel!]]),
      );
  });

  it('lists unposted types under Other', () => {
    Object.entries(NotificationTypeData.specs)
      .filter(([, spec]) => !spec.channel && !spec.signal)
      .forEach(([type]) => expect([type, sectionOf(type)]).toEqual([type, 'Other']));
  });

  it('leaves call signalling out', () => {
    const signals = Object.entries(NotificationTypeData.specs).filter(([, spec]) => spec.signal);
    expect(signals.length).toBeGreaterThan(0);
    signals.forEach(([type]) => expect(sectionOf(type)).toBeUndefined());
  });
});
