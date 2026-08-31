import {createContext, useContext} from 'react';

export interface ForumComposerContextType {
  /**
   * Appends an @mention of the given username to the thread composer, leaving any text
   * the user has already typed in place.
   */
  mentionUser: (username: string) => void;
}

export const ForumComposerContext = createContext<ForumComposerContextType | undefined>(undefined);

/**
 * Controls for the forum thread composer, or undefined when there is no composer on
 * screen. Undefined in post lists outside a thread (mentions, search, favorites) and in
 * a locked thread the user cannot post to, so callers can use it to decide whether to
 * offer composer-dependent actions such as Reply.
 *
 * React Native Paper menu items remount inside `Portal.Host` and therefore cannot read
 * this context. Call this hook from the menu itself and pass what you need down as a
 * prop. See `docs/Navigation.md`.
 */
export const useForumComposer = () => useContext(ForumComposerContext);
