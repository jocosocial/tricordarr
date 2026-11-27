import {type RefObject, useInsertionEffect, useRef} from 'react';

/**
 * Returns a stable ref that holds the latest committed `value`, for callbacks and effects that must
 * read the current value without being rebuilt when it changes.
 *
 * The ref is written in an insertion effect rather than during render, so it never holds a value
 * from a render React threw away. Read it only outside render (handlers, effects, cleanups).
 */
export const useLatestRef = <T>(value: T): RefObject<T> => {
  const ref = useRef(value);
  useInsertionEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
};
