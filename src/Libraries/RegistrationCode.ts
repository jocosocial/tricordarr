/**
 * Registration-code helpers matching Swiftarr `RegistrationCode`.
 * THO mails codes as "ABC DEF"; storage and matching use "abcdef".
 */

/**
 * Lowercase with all whitespace removed, including non-breaking spaces.
 */
export const normalized = (code: string): string => code.toLowerCase().replace(/\s/g, '');

/**
 * TRUE if `code` is a 6-character alphanumeric registration code, with optional whitespace.
 */
export const isWellFormed = (code: string): boolean => {
  const value = normalized(code);
  return value.length === 6 && /^[a-z0-9]+$/.test(value);
};

/**
 * Strips a spent `*` prefix used when a code has already been used for password recovery.
 */
const unspentVerification = (code: string): string => (code.startsWith('*') ? code.slice(1) : code);

/**
 * THO-style display form matching Swiftarr `#regCode` / `RegistrationCode.displayString`.
 * `abcabc` → `ABC ABC`.
 */
export const displayString = (code: string): string => {
  const display = normalized(unspentVerification(code)).toUpperCase();
  if (display.length !== 6) {
    return display;
  }
  return `${display.slice(0, 3)} ${display.slice(3)}`;
};
