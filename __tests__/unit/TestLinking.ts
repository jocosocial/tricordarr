import {readFileSync} from 'fs';
import {join} from 'path';

import {getPathFromState, getStateFromPath} from '@react-navigation/core';

import {navigationLinking} from '#src/Libraries/Linking';
import {debugLinkHosts, releaseLinkHosts} from '#src/Libraries/UrlParser';

const uuid = 'B13F1F2C-6CAC-4A33-A0AC-A19873EF5A12';

/**
 * Route path a state serializes back to. Regex params must not leak into generated paths.
 */
const pathForUrl = (path: string): string =>
  getPathFromState(getStateFromPath(path, navigationLinking.config)!, navigationLinking.config);

/**
 * Name of the deepest focused route that a path resolves to, as React Navigation would on an
 * incoming Universal Link or App Link.
 */
const screenForPath = (path: string): string | undefined => {
  let state = getStateFromPath(path, navigationLinking.config) as
    {routes: {name: string; state?: unknown}[]; index?: number} | undefined;
  let name: string | undefined;
  while (state) {
    const route = state.routes[state.index ?? state.routes.length - 1];
    name = route.name;
    state = route.state as typeof state;
  }
  return name;
};

describe('incoming link routes', () => {
  // Every path claimed in the issue and the server's apple-app-site-association.
  it.each([
    ['/about', 'AboutTwitarrScreen'],
    ['/faq', 'FaqScreen'],
    ['/codeOfConduct', 'MainConductScreen'],
    ['/map', 'MapScreen'],
    ['/time', 'MainTimeZoneScreen'],
    ['/hunts', 'HuntListScreen'],
    ['/directory', 'UserDirectoryScreen'],
    ['/users', 'UserDirectoryScreen'],
    ['/favorites', 'UsersListScreen'],
    ['/forums', 'ForumCategoriesScreen'],
    [`/forums/${uuid}`, 'ForumCategoryScreen'],
    ['/seamail', 'SeamailListScreen'],
    [`/seamail/${uuid}`, 'SeamailChatScreen'],
    ['/seamail/create', 'SiteUILinkScreen'],
    ['/lfg', 'LfgListScreen'],
    ['/lfg/joined', 'LfgListScreen'],
    ['/lfg/faq', 'LfgHelpScreen'],
    ['/lfg/create', 'SiteUILinkScreen'],
    [`/lfg/${uuid}`, 'LfgScreen'],
    [`/lfg/${uuid}/chat`, 'LfgChatScreen'],
    ['/events', 'ScheduleDayScreen'],
    [`/events/${uuid}`, 'EventScreen'],
    ['/events/photographerreport', 'SiteUILinkScreen'],
    [`/events/personal/${uuid}`, 'SiteUILinkScreen'],
    ['/boardgames', 'BoardgameListScreen'],
    [`/boardgames/${uuid}`, 'SiteUILinkScreen'],
    ['/karaoke', 'KaraokePerformanceListScreen'],
    ['/performers', 'PerformerListScreen'],
    ['/photostream', 'PhotostreamScreen'],
    ['/photostream/report', 'SiteUILinkScreen'],
    ['/profile', 'UserSelfProfileScreen'],
    ['/eventfeedback', 'EventFeedbackSelectScreen'],
    [`/forum/${uuid}`, 'ForumThreadScreen'],
    ['/forum/search', 'SiteUILinkScreen'],
    ['/forum/containingpost/123', 'ForumThreadPostScreen'],
    [`/forumpost/${uuid}`, 'SiteUILinkScreen'],
    [`/performer/${uuid}`, 'PerformerScreen'],
    ['/performer/shadow/self', 'PerformerSelfScreen'],
    [`/user/${uuid}`, 'UserProfileScreen'],
    ['/username/grant', 'UsernameProfileScreen'],
    [`/privateevent/${uuid}`, 'PersonalEventScreen'],
    [`/hunt/${uuid}`, 'HuntScreen'],
    [`/puzzle/${uuid}`, 'HuntPuzzleScreen'],
  ])('%s opens %s', (path, screen) => {
    expect(screenForPath(path)).toBe(screen);
  });

  it('passes a known LFG endpoint through as a param', () => {
    const state = JSON.stringify(getStateFromPath('/lfg/joined', navigationLinking.config));
    expect(state).toContain('"endpoint":"joined"');
  });

  it('round-trips restricted params without the regex', () => {
    expect(pathForUrl(`/events/${uuid}`)).toBe(`/events/${uuid}`);
    expect(pathForUrl('/lfg/joined')).toBe('/lfg/joined');
  });

  it('passes the ID through a UUID-restricted param', () => {
    const state = JSON.stringify(getStateFromPath(`/events/${uuid}`, navigationLinking.config));
    expect(state).toContain(`"eventID":"${uuid}"`);
  });
});

describe('native link claims', () => {
  const read = (...parts: string[]) => readFileSync(join(__dirname, '..', '..', ...parts), 'utf8');
  const matches = (text: string, regex: RegExp) => [...text.matchAll(regex)].map(match => match[1]).sort();
  const sorted = (hosts: string[]) => [...hosts].sort();
  const applinks = (file: string) => matches(read('ios', 'Tricordarr', file), /applinks:([^<]+)</g);
  const webcredentials = (file: string) => matches(read('ios', 'Tricordarr', file), /webcredentials:([^<]+)</g);
  const assetStatements = (buildType: string) =>
    matches(
      read('android', 'app', 'src', buildType, 'res', 'values', 'asset_statements.xml'),
      /https:\/\/([^/]+)\/\.well-known\/assetlinks\.json/g,
    );
  const manifest = (buildType: string) => read('android', 'app', 'src', buildType, 'AndroidManifest.xml');
  const hosts = (buildType: string) => matches(manifest(buildType), /android:host="([^"]+)"/g);
  const paths = (buildType: string) => matches(manifest(buildType), /android:path\w*="([^"]+)"/g);

  it('claims the release hosts in release builds', () => {
    expect(applinks('Tricordarr.entitlements')).toEqual(sorted(releaseLinkHosts));
    expect(hosts('release')).toEqual(sorted(releaseLinkHosts));
  });

  it('claims the debug hosts in debug builds', () => {
    expect(applinks('Tricordarr.Debug.entitlements')).toEqual(sorted(debugLinkHosts));
    expect(hosts('debug')).toEqual(sorted(debugLinkHosts));
  });

  it('claims every Android path, matching the server', () => {
    expect(paths('debug')).toEqual([]);
    expect(paths('release')).toEqual([]);
  });

  it('shares credentials with the hosts each build claims', () => {
    expect(webcredentials('Tricordarr.entitlements')).toEqual(sorted(releaseLinkHosts));
    expect(webcredentials('Tricordarr.Debug.entitlements')).toEqual(sorted(debugLinkHosts));
    expect(assetStatements('release')).toEqual(sorted(releaseLinkHosts));
    expect(assetStatements('debug')).toEqual(sorted(debugLinkHosts));
  });
});
