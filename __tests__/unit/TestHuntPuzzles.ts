import {hintsToJson, parseHintsJson, parseHuntPuzzlesJson} from '#src/Libraries/Admin/HuntPuzzles';

describe('parseHuntPuzzlesJson', () => {
  it('returns an empty list for blank input', () => {
    expect(parseHuntPuzzlesJson('')).toEqual([]);
    expect(parseHuntPuzzlesJson('   ')).toEqual([]);
  });

  it('parses a puzzle object', () => {
    expect(
      parseHuntPuzzlesJson(
        '[{"title":"One","body":"Body","answer":"42","unlockTime":"2026-01-01T12:00:00.000Z","hints":{"1":"even"}}]',
      ),
    ).toEqual([
      {
        title: 'One',
        body: 'Body',
        answer: '42',
        hints: {1: 'even'},
        unlockTime: '2026-01-01T12:00:00.000Z',
      },
    ]);
  });

  it('rejects non-array JSON', () => {
    expect(() => parseHuntPuzzlesJson('{"title":"nope"}')).toThrow('Puzzles must be a JSON array.');
  });
});

describe('parseHintsJson', () => {
  it('parses a string map', () => {
    expect(parseHintsJson('{"a":"b"}')).toEqual({a: 'b'});
  });

  it('rejects arrays', () => {
    expect(() => parseHintsJson('["nope"]')).toThrow('Hints must be a JSON object');
  });
});

describe('hintsToJson', () => {
  it('stringifies an empty map as an object', () => {
    expect(hintsToJson()).toBe('{}');
    expect(JSON.parse(hintsToJson({a: 'b'}))).toEqual({a: 'b'});
  });
});
