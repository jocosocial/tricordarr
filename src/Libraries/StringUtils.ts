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
 * This is a helper function to get the badge display value for a given input.
 * The intention is that the badges should only be shown for new message count,
 * not for added to or other such things like that.
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
