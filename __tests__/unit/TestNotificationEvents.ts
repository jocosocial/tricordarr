import fs from 'fs';

import {notificationEventTitles} from '#src/Libraries/Notifications/NotificationEventTitles';
import {allRoutes, pathToRegex} from '#src/Libraries/RouteDefinitions';
import {NotificationTypeData} from '#src/Structs/SocketStructs';

import notificationEvents from '#specs/NotificationEvents.json';

import {KOTLIN_PATH, renderKotlin, renderSwift, SWIFT_PATH} from '#scripts/generate-notification-events';

// specs/NotificationEvents.json is imported by TS, and the Swift and Kotlin tables are generated from
// it by scripts/generate-notification-events.js. These tests keep the generated files and the TS
// enum from drifting.

describe('NotificationEvents.json', () => {
  it('lists every TS enum event type exactly once, as posted or unposted', () => {
    const listed = [...Object.keys(notificationEvents.events), ...Object.keys(notificationEvents.unposted)];
    expect([...listed].sort()).toEqual((Object.values(NotificationTypeData) as string[]).sort());
  });

  it('matches the checked-in generated Swift and Kotlin tables', () => {
    expect(fs.readFileSync(SWIFT_PATH, 'utf8')).toBe(renderSwift(notificationEvents));
    expect(fs.readFileSync(KOTLIN_PATH, 'utf8')).toBe(renderKotlin(notificationEvents));
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
