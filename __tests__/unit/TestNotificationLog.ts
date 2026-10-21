import {applyRetentionAndDedup, parseJsonl, trimToMaxEntries} from '#src/Libraries/NotificationLog/parsing';
import {NotificationLogEntry} from '#src/Libraries/NotificationLog/types';

const makeLine = (
  overrides: Partial<Record<'timestamp' | 'type' | 'contentID' | 'info' | 'source' | 'raw', string>> = {},
) =>
  JSON.stringify({
    timestamp: '2026-01-01T00:00:00.000Z',
    type: 'seamailUnreadMsg',
    contentID: '123',
    info: 'New message',
    source: 'app',
    raw: '{"type":{"seamailUnreadMsg":{}},"info":"New message","contentID":"123"}',
    ...overrides,
  });

describe('parseJsonl', () => {
  it('round-trips a serialized entry back into a NotificationLogEntry', () => {
    const entries = parseJsonl(makeLine());
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      type: 'seamailUnreadMsg',
      contentID: '123',
      info: 'New message',
      source: 'app',
    });
    expect(entries[0].timestamp.toISOString()).toBe('2026-01-01T00:00:00.000Z');
  });

  it('drops lines that fail to parse as JSON', () => {
    const text = [makeLine(), 'not json', ''].join('\n');
    expect(parseJsonl(text)).toHaveLength(1);
  });

  it('drops lines with an unparseable timestamp', () => {
    const text = makeLine({timestamp: 'not a date'});
    expect(parseJsonl(text)).toHaveLength(0);
  });

  it('parses multiple lines', () => {
    const text = [makeLine({contentID: '1'}), makeLine({contentID: '2'})].join('\n');
    expect(parseJsonl(text).map(e => e.contentID)).toEqual(['1', '2']);
  });
});

describe('trimToMaxEntries', () => {
  it('leaves a short list untouched', () => {
    const lines = ['a', 'b', 'c'];
    expect(trimToMaxEntries(lines)).toEqual(lines);
  });

  it('keeps only the newest (last) MAX_ENTRIES lines', () => {
    const lines = Array.from({length: 1005}, (_, i) => `line-${i}`);
    const trimmed = trimToMaxEntries(lines);
    expect(trimmed).toHaveLength(1000);
    expect(trimmed[0]).toBe('line-5');
    expect(trimmed[trimmed.length - 1]).toBe('line-1004');
  });
});

describe('applyRetentionAndDedup', () => {
  const makeEntry = (overrides: Partial<NotificationLogEntry> = {}): NotificationLogEntry => ({
    timestamp: new Date(),
    type: 'seamailUnreadMsg',
    contentID: '123',
    info: 'New message',
    source: 'app',
    raw: '{}',
    ...overrides,
  });

  it('drops entries older than the 7-day retention window', () => {
    const now = Date.now();
    const recent = makeEntry({timestamp: new Date(now - 1000)});
    const stale = makeEntry({timestamp: new Date(now - 8 * 24 * 60 * 60 * 1000), contentID: '456'});
    const result = applyRetentionAndDedup([recent, stale]);
    expect(result.map(e => e.contentID)).toEqual(['123']);
  });

  it('returns newest-first', () => {
    const now = Date.now();
    const older = makeEntry({timestamp: new Date(now - 5000), contentID: 'older'});
    const newer = makeEntry({timestamp: new Date(now), contentID: 'newer'});
    const result = applyRetentionAndDedup([older, newer]);
    expect(result.map(e => e.contentID)).toEqual(['newer', 'older']);
  });

  it('collapses duplicate type+contentID+info entries within the 5s dedup window', () => {
    const now = Date.now();
    const first = makeEntry({timestamp: new Date(now - 1000)});
    const duplicate = makeEntry({timestamp: new Date(now)});
    const result = applyRetentionAndDedup([first, duplicate]);
    expect(result).toHaveLength(1);
  });

  it('keeps entries with the same key more than the dedup window apart', () => {
    const now = Date.now();
    const first = makeEntry({timestamp: new Date(now - 10000)});
    const second = makeEntry({timestamp: new Date(now)});
    const result = applyRetentionAndDedup([first, second]);
    expect(result).toHaveLength(2);
  });

  it('does not collapse entries with a different contentID', () => {
    const now = Date.now();
    const a = makeEntry({timestamp: new Date(now - 1000), contentID: 'a'});
    const b = makeEntry({timestamp: new Date(now), contentID: 'b'});
    const result = applyRetentionAndDedup([a, b]);
    expect(result).toHaveLength(2);
  });
});
