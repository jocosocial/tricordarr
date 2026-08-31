import {appSiteUrl, appUrl, joinUrl} from '#src/Libraries/UrlParser';

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
