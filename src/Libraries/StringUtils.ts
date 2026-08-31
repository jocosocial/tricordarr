/**
 * Utility functions for string manipulation and formatting.
 */

/**
 * Masks a sensitive string by showing only the first three characters
 * and replacing the remaining characters with asterisks.
 *
 * @param originalText The string to mask. If undefined or empty, returns an empty string.
 * @returns The masked string (e.g., "abc***" for "abcdefg")
 */
export const toSecureString = (originalText?: string): string => {
  if (!originalText) {
    return '';
  }
  // Extract the first three characters
  const firstThreeCharacters = originalText.slice(0, 3);

  // Replace the remaining characters with asterisks
  const asterisks = '*'.repeat(originalText.length - 3);

  // Concatenate the first three characters with asterisks
  return firstThreeCharacters + asterisks;
};

/**
 * Whether `username` is already @mentioned in `text` as a standalone word.
 *
 * Matching is case-insensitive because Swiftarr matches mentions case-insensitively
 * (`ContentFilterable.filterForMention` uses `.caseInsensitive`).
 *
 * @param text The text to search.
 * @param username The username to look for, without the leading `@`.
 * @returns True if the text already mentions that user.
 */
export const isMentioned = (text: string, username: string): boolean => {
  const mention = `@${username}`.toLowerCase();
  return text
    .toLowerCase()
    .split(/\s+/)
    .some(token => token === mention);
};

/**
 * Appends an @mention of `username` to composer text.
 *
 * Swiftarr only counts a mention when the `@` is preceded by whitespace or the start of
 * the string (the `(?<!\S)@` in `ContentFilterable.getMentionsSet`), so this always
 * inserts a separating space when the existing text does not end in whitespace.
 *
 * A user already mentioned in the text is not added again, so tapping Reply twice on the
 * same author does not stack duplicates. Mentioning several different authors still works.
 *
 * @param text The current composer text.
 * @param username The username to mention, without the leading `@`.
 * @returns The text with the mention appended, followed by a trailing space to type after.
 */
export const appendMention = (text: string, username: string): string => {
  if (isMentioned(text, username)) {
    return text;
  }
  const mention = `@${username}`;
  if (!text) {
    return `${mention} `;
  }
  const separator = /\s$/.test(text) ? '' : ' ';
  return `${text}${separator}${mention} `;
};

/**
 * Hide a tab/list badge when the count is 0. React Navigation treats a defined
 * `tabBarBadge` as visible, so a 0 would otherwise render as a badge.
 *
 * @param input The number to check. If undefined or 0, returns undefined.
 * @returns The input value if it's greater than 0, otherwise undefined.
 */
export const getBadgeDisplayValue = (input: number | undefined): number | undefined => {
  if (input === 0) {
    return undefined;
  }
  return input;
};
