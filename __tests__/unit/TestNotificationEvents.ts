import fs from 'fs';

import {allRoutes, pathToRegex} from '#src/Libraries/RouteDefinitions';

import notificationEvents from '#specs/NotificationEvents.json';

import {
  KOTLIN_PATH,
  renderKotlin,
  renderSwift,
  renderTypeScript,
  SWIFT_PATH,
  TS_PATH,
} from '#scripts/generate-notification-events';

// The TS, Swift and Kotlin tables are generated from specs/NotificationEvents.json by
// scripts/generate-notification-events.js. These tests keep the generated files from drifting and
// check the JSON against the rest of the app.

describe('NotificationEvents.json', () => {
  it('matches the checked-in generated TS, Swift and Kotlin tables', () => {
    expect(fs.readFileSync(TS_PATH, 'utf8')).toBe(renderTypeScript(notificationEvents));
    expect(fs.readFileSync(SWIFT_PATH, 'utf8')).toBe(renderSwift(notificationEvents));
    expect(fs.readFileSync(KOTLIN_PATH, 'utf8')).toBe(renderKotlin(notificationEvents));
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
