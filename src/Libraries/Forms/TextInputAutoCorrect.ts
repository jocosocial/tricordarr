/**
 * React Native defaults autoCorrect to true. Identifier fields use
 * autoCapitalize="none"; unless the caller overrides, disable autocorrect
 * so iOS does not rewrite usernames (https://github.com/jocosocial/tricordarr/issues/497).
 */
export const resolveTextInputAutoCorrect = (
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters',
  autoCorrect?: boolean,
): boolean | undefined => autoCorrect ?? (autoCapitalize === 'none' ? false : undefined);
