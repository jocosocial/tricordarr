import {notificationEventTitles} from '#src/Libraries/Notifications/NotificationEventTitles';
import {allRoutes, pathToRegex} from '#src/Libraries/RouteDefinitions';
import {NotificationTypeData} from '#src/Structs/SocketStructs';

import notificationEvents from '#specs/NotificationEvents.json';

// specs/NotificationEvents.json is read by TS and Kotlin, so these tests are what keeps the
// copies from drifting.

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
