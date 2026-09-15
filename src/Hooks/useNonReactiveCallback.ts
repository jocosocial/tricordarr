import {useCallback, useInsertionEffect, useRef} from 'react';

/**
 * Returns a stable function identity that always calls the latest `fn`.
 *
 * Use sparingly. It erases reactivity: when inputs change, the function itself
 * stays the same, so nothing below in the tree can "react" to that change
 * (for example by knowing to call the function again).
 *
 * Avoid calling the returned function during rendering; the values it captures
 * lag behind.
 *
 * Ported from Bluesky:
 * https://github.com/bluesky-social/social-app/blob/main/src/lib/hooks/useNonReactiveCallback.ts
 */
export function useNonReactiveCallback<Args extends unknown[], Return>(
  fn: (...args: Args) => Return,
): (...args: Args) => Return {
  const ref = useRef(fn);
  useInsertionEffect(() => {
    ref.current = fn;
  }, [fn]);
  return useCallback((...args: Args) => {
    return ref.current(...args);
  }, []);
}
