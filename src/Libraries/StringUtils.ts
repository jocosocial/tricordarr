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
 * THO-style display form matching Swiftarr `#regCode` / `RegistrationCode.displayString`.
 * Strips a spent `*` prefix, drops whitespace, uppercases, and inserts a space after
 * three characters when the result is 6 long (`abcabc` → `ABC ABC`).
 */
export const formatRegCodeDisplay = (code: string): string => {
  if (!code) {
    return '';
  }
  const unspent = code.startsWith('*') ? code.slice(1) : code;
  const display = unspent.replace(/\s/g, '').toUpperCase();
  if (display.length !== 6) {
    return display;
  }
  return `${display.slice(0, 3)} ${display.slice(3)}`;
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
