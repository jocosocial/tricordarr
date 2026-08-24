import {ShareContentType} from '#src/Enums/ShareContentType';

describe('ShareContentType.performer', () => {
  it('uses the singular performer profile path, not the list path', () => {
    expect(ShareContentType.performer).toBe('performer');
    expect(ShareContentType.performer).not.toBe('performers');
  });

  it('builds the same URL shape ShareMenuItem uses for other content', () => {
    const serverUrl = 'https://twitarr.com';
    const performerID = 'abc-123';
    expect(`${serverUrl}/${ShareContentType.performer}/${performerID}`).toBe('https://twitarr.com/performer/abc-123');
  });
});
