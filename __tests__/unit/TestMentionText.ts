import {appendMention, isMentioned} from '#src/Libraries/StringUtils';

describe('isMentioned', () => {
  it('finds a mention as a standalone word', () => {
    expect(isMentioned('@grant hello', 'grant')).toBe(true);
    expect(isMentioned('hello @grant', 'grant')).toBe(true);
    expect(isMentioned('hello @grant there', 'grant')).toBe(true);
  });

  it('matches case-insensitively like Swiftarr does', () => {
    expect(isMentioned('hello @Grant', 'grant')).toBe(true);
    expect(isMentioned('hello @grant', 'GRANT')).toBe(true);
  });

  it('does not match a longer username that starts with the same text', () => {
    expect(isMentioned('hello @grantcohoe', 'grant')).toBe(false);
  });

  it('ignores trailing punctuation', () => {
    expect(isMentioned('hi @grant, how are you', 'grant')).toBe(true);
    expect(isMentioned('ask @grant.', 'grant')).toBe(true);
    expect(isMentioned('ask @grant?', 'grant')).toBe(true);
    expect(isMentioned('(cc @grant)', 'grant')).toBe(true);
  });

  it('keeps punctuation that is part of the username', () => {
    expect(isMentioned('hi @grant.cohoe, hello', 'grant.cohoe')).toBe(true);
    // Stripping the trailing dot must not collapse this onto a shorter name.
    expect(isMentioned('hi @grant.cohoe.', 'grant')).toBe(false);
  });

  it('does not match when the @ is not preceded by whitespace', () => {
    // Swiftarr's (?<!\S)@ rule means this is not a mention, so it must not dedupe.
    expect(isMentioned('mail me at foo@grant', 'grant')).toBe(false);
  });

  it('does not match the username without an @', () => {
    expect(isMentioned('hello grant', 'grant')).toBe(false);
  });

  it('handles empty text', () => {
    expect(isMentioned('', 'grant')).toBe(false);
  });
});

describe('appendMention', () => {
  it('mentions into an empty composer', () => {
    expect(appendMention('', 'grant')).toBe('@grant ');
  });

  it('separates the mention from existing text', () => {
    // Swiftarr's getMentionsSet requires whitespace before the @.
    expect(appendMention('hello', 'grant')).toBe('hello @grant ');
  });

  it('does not double the separator when the text already ends in whitespace', () => {
    expect(appendMention('hello ', 'grant')).toBe('hello @grant ');
    expect(appendMention('hello\n', 'grant')).toBe('hello\n@grant ');
  });

  it('leaves the text alone when that user is already mentioned', () => {
    expect(appendMention('@grant hello', 'grant')).toBe('@grant hello');
    expect(appendMention('@grant ', 'grant')).toBe('@grant ');
  });

  it('still mentions a different user', () => {
    expect(appendMention('@grant hello', 'cohoe')).toBe('@grant hello @cohoe ');
  });

  it('supports the punctuation Swiftarr allows in usernames', () => {
    expect(appendMention('hi', 'grant.cohoe')).toBe('hi @grant.cohoe ');
    expect(appendMention('@grant.cohoe hi', 'grant.cohoe')).toBe('@grant.cohoe hi');
  });

  it('does not re-add a user mentioned before punctuation', () => {
    expect(appendMention('hi @grant, ok', 'grant')).toBe('hi @grant, ok');
    expect(appendMention('thanks @grant!', 'grant')).toBe('thanks @grant!');
  });
});
