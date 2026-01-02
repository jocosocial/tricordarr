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
