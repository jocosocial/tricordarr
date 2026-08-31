import {getShareLink, ShareContentType, ShareLinkMode} from '#src/Libraries/Sharing';
import {appLinkPrefix} from '#src/Libraries/UrlParser';

describe('ShareContentType.performer', () => {
  it('uses the singular performer profile path, not the list path', () => {
    expect(ShareContentType.performer).toBe('performer');
    expect(ShareContentType.performer).not.toBe('performers');
  });
});

describe('ShareContentType.hunt', () => {
  it('uses the singular hunt path, not the catalog path', () => {
    expect(ShareContentType.hunt).toBe('hunt');
    expect(ShareContentType.hunt).not.toBe('hunts');
  });
});

describe('ShareContentType.puzzle', () => {
  it('uses the singular puzzle path', () => {
    expect(ShareContentType.puzzle).toBe('puzzle');
    expect(ShareContentType.puzzle).not.toBe('puzzles');
  });
});

describe('getShareLink', () => {
  const serverUrl = 'https://twitarr.com';

  it('builds a public web URL from type and ID', () => {
    expect(
      getShareLink({
        mode: ShareLinkMode.web,
        serverUrl,
        contentType: ShareContentType.performer,
        contentID: 'abc-123',
      }),
    ).toBe('https://twitarr.com/performer/abc-123');
  });

  it('returns siteUI content IDs as full web URLs', () => {
    expect(
      getShareLink({
        mode: ShareLinkMode.web,
        serverUrl,
        contentType: ShareContentType.siteUI,
        contentID: 'https://twitarr.com/faq',
      }),
    ).toBe('https://twitarr.com/faq');
  });

  it('builds a tricordarr deep link from type and ID', () => {
    expect(
      getShareLink({
        mode: ShareLinkMode.app,
        serverUrl,
        contentType: ShareContentType.forum,
        contentID: 'abc',
      }),
    ).toBe(`${appLinkPrefix}forum/abc`);
  });

  it('builds a performer deep link without a web-URL roundtrip', () => {
    expect(
      getShareLink({
        mode: ShareLinkMode.app,
        serverUrl,
        contentType: ShareContentType.performer,
        contentID: 'abc-123',
      }),
    ).toBe(`${appLinkPrefix}performer/abc-123`);
  });

  it('builds a hunt web URL and deep link', () => {
    expect(
      getShareLink({
        mode: ShareLinkMode.web,
        serverUrl,
        contentType: ShareContentType.hunt,
        contentID: 'hunt-1',
      }),
    ).toBe('https://twitarr.com/hunt/hunt-1');
    expect(
      getShareLink({
        mode: ShareLinkMode.app,
        serverUrl,
        contentType: ShareContentType.hunt,
        contentID: 'hunt-1',
      }),
    ).toBe(`${appLinkPrefix}hunt/hunt-1`);
  });

  it('builds a puzzle web URL and deep link', () => {
    expect(
      getShareLink({
        mode: ShareLinkMode.web,
        serverUrl,
        contentType: ShareContentType.puzzle,
        contentID: 'puzzle-1',
      }),
    ).toBe('https://twitarr.com/puzzle/puzzle-1');
    expect(
      getShareLink({
        mode: ShareLinkMode.app,
        serverUrl,
        contentType: ShareContentType.puzzle,
        contentID: 'puzzle-1',
      }),
    ).toBe(`${appLinkPrefix}puzzle/puzzle-1`);
  });

  it('extracts the path from a siteUI web URL', () => {
    expect(
      getShareLink({
        mode: ShareLinkMode.app,
        serverUrl,
        contentType: ShareContentType.siteUI,
        contentID: 'https://twitarr.com/faq',
      }),
    ).toBe(`${appLinkPrefix}faq`);
  });

  it('preserves query and hash on siteUI app links', () => {
    expect(
      getShareLink({
        mode: ShareLinkMode.app,
        serverUrl,
        contentType: ShareContentType.siteUI,
        contentID: 'https://twitarr.com/events/abc?foo=1#bar',
      }),
    ).toBe(`${appLinkPrefix}events/abc?foo=1#bar`);
  });
});
