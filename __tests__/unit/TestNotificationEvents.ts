import {contentChannelGroup, systemChannelGroup} from '#src/Libraries/Notifications/ChannelGroups';
import {
  announcementsChannel,
  callMgmtChannel,
  callsChannel,
  connectionChannel,
  eventChannel,
  forumChannel,
  lfgChannel,
  seamailChannel,
  serviceChannel,
} from '#src/Libraries/Notifications/Channels';
import {notificationEventTitles} from '#src/Libraries/Notifications/NotificationEventTitles';
import {allRoutes, pathToRegex} from '#src/Libraries/RouteDefinitions';
import {NotificationTypeData} from '#src/Structs/SocketStructs';

import notificationEvents from '#specs/NotificationEvents.json';

// specs/NotificationEvents.json is read by TS, Kotlin (and eventually Swift), so these tests are
// what keeps the copies from drifting.

jest.mock('react-native-notify-kit', () => ({
  __esModule: true,
  default: {},
  AndroidImportance: {},
}));

const tsChannels = [
  connectionChannel,
  serviceChannel,
  seamailChannel,
  lfgChannel,
  announcementsChannel,
  forumChannel,
  callsChannel,
  callMgmtChannel,
  eventChannel,
];

describe('NotificationEvents.json', () => {
  it('only describes event types the TS enum knows about', () => {
    const known = Object.values(NotificationTypeData) as string[];
    Object.keys(notificationEvents.events).forEach(type => expect(known).toContain(type));
  });

  it('feeds the TS titles', () => {
    Object.entries(notificationEvents.events).forEach(([type, event]) => {
      expect(notificationEventTitles[type as keyof typeof NotificationTypeData]).toBe(event.title);
    });
  });

  it('agrees with the TS channel definitions', () => {
    const jsonChannels = notificationEvents.channels as Record<
      string,
      {name: string; group: string; description: string; vibrationPattern?: number[]}
    >;
    expect(Object.keys(jsonChannels).sort()).toEqual(tsChannels.map(channel => channel.id).sort());
    tsChannels.forEach(channel => {
      const json = jsonChannels[channel.id];
      expect(json.name).toBe(channel.name);
      expect(json.group).toBe(channel.groupId);
      expect(json.description).toBe(channel.description);
      expect(json.vibrationPattern).toEqual(channel.vibrationPattern);
    });
  });

  it('agrees with the TS channel groups', () => {
    const groups = notificationEvents.channelGroups as Record<string, {name: string; description: string}>;
    [systemChannelGroup, contentChannelGroup].forEach(group => {
      expect(groups[group.id]).toEqual({name: group.name, description: group.description});
    });
    expect(Object.keys(groups)).toHaveLength(2);
  });

  it('references only declared channels', () => {
    const channels = Object.keys(notificationEvents.channels);
    Object.values(notificationEvents.events).forEach(event => expect(channels).toContain(event.channel));
  });

  it('points every URL at a real route', () => {
    const unrouted = Object.entries(notificationEvents.events)
      .filter(([, event]) => (event as {url?: string}).url)
      .filter(([, event]) => {
        const concrete = (event as {url: string}).url
          .replace('{contentID}', 'abc')
          .replace('{callerUserID}', '1')
          .replace('{callerUsername}', 'bob')
          .replace(/^\//, '');
        return !allRoutes.some(route => pathToRegex(route.path).test(concrete));
      })
      .map(([type]) => type);
    expect(unrouted).toEqual([]);
  });

  it('gives every chat messaging event a fez mark-as-read path', () => {
    const chats = Object.values(notificationEvents.events).filter(event => (event as {messaging?: boolean}).messaging);
    expect(chats.length).toBeGreaterThan(0);
    expect(chats.map(event => (event as {markAsReadUrl?: string}).markAsReadUrl)).toEqual(
      chats.map(() => '/fez/{contentID}'),
    );
  });
});
