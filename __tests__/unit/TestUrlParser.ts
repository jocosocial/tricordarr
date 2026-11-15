import {
  appLinkPrefix,
  appSiteUrl,
  appUrl,
  extractPathFromTricordarrUrl,
  isForeignAppLink,
  isTwitarrUrl,
  isUniversalLink,
  joinUrl,
  shouldRouteIncomingLink,
} from '#src/Libraries/UrlParser';

describe('appUrl', () => {
  it('joins a path onto the tricordarr scheme without a third slash', () => {
    expect(appUrl('time')).toBe('tricordarr://time');
  });

  it('strips a leading slash so the scheme stays at two slashes', () => {
    expect(appUrl('/time')).toBe('tricordarr://time');
  });

  it('coerces numeric segments', () => {
    expect(appUrl('twitarrtab', 123, 'time')).toBe('tricordarr://twitarrtab/123/time');
  });

  it('preserves query and hash on the last segment', () => {
    expect(appUrl('events/abc?foo=1#bar')).toBe('tricordarr://events/abc?foo=1#bar');
  });
});

describe('joinUrl', () => {
  it('joins an origin and path regardless of slash placement', () => {
    expect(joinUrl('https://twitarr.com/', '/forum', 'abc')).toBe('https://twitarr.com/forum/abc');
  });

  it('omits undefined parts without a trailing slash', () => {
    expect(joinUrl('https://twitarr.com', undefined)).toBe('https://twitarr.com');
  });

  it('omits empty parts without a trailing slash', () => {
    expect(joinUrl('https://twitarr.com', '')).toBe('https://twitarr.com');
  });
});

describe('appSiteUrl', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(123);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('prefixes twitarrtab and a cache-busting timestamp', () => {
    expect(appSiteUrl()).toBe('tricordarr://twitarrtab/123');
  });

  it('joins remaining path segments like appUrl', () => {
    expect(appSiteUrl('dayplanner', 'shutternauts')).toBe('tricordarr://twitarrtab/123/dayplanner/shutternauts');
  });
});

describe('extractPathFromTricordarrUrl', () => {
  it('strips the app scheme prefix from a puzzle deep link', () => {
    expect(extractPathFromTricordarrUrl(`${appLinkPrefix}puzzle/B13F1F2C-6CAC-4A33-A0AC-A19873EF5A12`)).toBe(
      'puzzle/B13F1F2C-6CAC-4A33-A0AC-A19873EF5A12',
    );
  });

  it('returns undefined for http URLs', () => {
    expect(extractPathFromTricordarrUrl('https://twitarr.com/puzzle/abc')).toBeUndefined();
  });
});

describe('isTwitarrUrl', () => {
  const serverUrl = 'https://twitarr.com';
  const canonicalHostnames = ['twitarr.com'];

  it('treats app-scheme deep links as in-app URLs', () => {
    expect(
      isTwitarrUrl(`${appLinkPrefix}puzzle/B13F1F2C-6CAC-4A33-A0AC-A19873EF5A12`, serverUrl, canonicalHostnames),
    ).toBe(true);
  });

  it('treats relative paths as in-app URLs', () => {
    expect(isTwitarrUrl('/events/123', serverUrl, canonicalHostnames)).toBe(true);
  });

  it('treats the configured server as in-app', () => {
    expect(isTwitarrUrl(`${serverUrl}/forum/abc`, serverUrl, canonicalHostnames)).toBe(true);
  });

  it('rejects unrelated https URLs', () => {
    expect(isTwitarrUrl('https://example.com/puzzle/abc', serverUrl, canonicalHostnames)).toBe(false);
  });
});

describe('isUniversalLink', () => {
  it('matches https links on a claimed host', () => {
    expect(isUniversalLink('https://twitarr.com/forum/abc')).toBe(true);
  });

  it('ignores http, unclaimed hosts, and the app scheme', () => {
    expect(isUniversalLink('http://twitarr.com/forum/abc')).toBe(false);
    expect(isUniversalLink('https://www.twitarr.com/forum/abc')).toBe(false);
    expect(isUniversalLink('https://example.com/forum/abc')).toBe(false);
    expect(isUniversalLink(`${appLinkPrefix}forum/abc`)).toBe(false);
  });
});

describe('isForeignAppLink', () => {
  const canonicalHostnames = ['twitarr.com'];

  it('is false for a link on the session server', () => {
    expect(isForeignAppLink('https://beta.twitarr.com/forum/abc', 'https://beta.twitarr.com', canonicalHostnames)).toBe(
      false,
    );
  });

  it.each(['https://twitarr.com', 'https://start.twitarr.com', 'https://beta.twitarr.com', 'http://127.0.0.1:3050'])(
    'treats the canonical host as local on %s',
    serverUrl => {
      expect(isForeignAppLink('https://twitarr.com/forum/abc', serverUrl, canonicalHostnames)).toBe(false);
    },
  );

  it('is true for a claimed host that is not the session server', () => {
    expect(
      isForeignAppLink('https://beta.twitarr.com/forum/abc', 'https://start.twitarr.com', canonicalHostnames),
    ).toBe(true);
    expect(isForeignAppLink('https://start.twitarr.com/forum/abc', 'https://twitarr.com', canonicalHostnames)).toBe(
      true,
    );
  });

  it('is true on a custom or emulator server', () => {
    expect(isForeignAppLink('https://beta.twitarr.com/forum/abc', 'http://10.0.2.2:3050', canonicalHostnames)).toBe(
      true,
    );
  });

  it('is false for unclaimed hosts and the app scheme', () => {
    expect(isForeignAppLink('https://example.com/forum/abc', 'https://twitarr.com', canonicalHostnames)).toBe(false);
    expect(isForeignAppLink(`${appLinkPrefix}forum/abc`, 'https://twitarr.com', canonicalHostnames)).toBe(false);
  });
});

describe('shouldRouteIncomingLink', () => {
  const canonicalHostnames = ['twitarr.com'];
  const serverUrl = 'https://start.twitarr.com';

  it('routes a matching link once OOBE is done', () => {
    expect(shouldRouteIncomingLink('https://start.twitarr.com/forums', true, serverUrl, canonicalHostnames)).toBe(true);
  });

  it('drops a universal link before OOBE is done', () => {
    expect(shouldRouteIncomingLink('https://start.twitarr.com/forums', false, serverUrl, canonicalHostnames)).toBe(
      false,
    );
  });

  it('drops a link for another server', () => {
    expect(shouldRouteIncomingLink('https://beta.twitarr.com/forums', true, serverUrl, canonicalHostnames)).toBe(false);
  });

  it('always routes the app scheme, including during OOBE', () => {
    expect(shouldRouteIncomingLink(`${appLinkPrefix}oobe`, false, serverUrl, canonicalHostnames)).toBe(true);
  });
});
