import {displayString, isWellFormed, normalized} from '#src/Libraries/RegistrationCode';

describe('normalized', () => {
  it('lowercases and strips spaces', () => {
    expect(normalized('ABC DEF')).toBe('abcdef');
  });

  it('strips non-breaking spaces', () => {
    expect(normalized('ABC\u00a0DEF')).toBe('abcdef');
  });

  it('leaves an already-normalized code unchanged', () => {
    expect(normalized('abcdef')).toBe('abcdef');
  });
});

describe('isWellFormed', () => {
  it('accepts 6 alphanumeric characters with optional spaces', () => {
    expect(isWellFormed('abcdef')).toBe(true);
    expect(isWellFormed('ABC DEF')).toBe(true);
    expect(isWellFormed('ab12cd')).toBe(true);
  });

  it('rejects empty, short, long, or non-alphanumeric values', () => {
    expect(isWellFormed('')).toBe(false);
    expect(isWellFormed('abc')).toBe(false);
    expect(isWellFormed('abcdefg')).toBe(false);
    expect(isWellFormed('ABC-DEF')).toBe(false);
  });
});

describe('displayString', () => {
  it('formats a 6-character code as two groups', () => {
    expect(displayString('abcabc')).toBe('ABC ABC');
  });

  it('strips a spent prefix before formatting', () => {
    expect(displayString('*abcdef')).toBe('ABC DEF');
  });

  it('returns an empty string unchanged', () => {
    expect(displayString('')).toBe('');
  });

  it('uppercases codes that are not 6 characters after normalize', () => {
    expect(displayString('abc')).toBe('ABC');
  });
});
