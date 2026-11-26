import {useState} from 'react';

/**
 * Returns the first defined `candidate` seen across renders and keeps returning it, ignoring later
 * candidates. Returns `undefined` until a defined candidate arrives.
 *
 * Stored as React state updated during render (the "adjust state while rendering" pattern), so the
 * render that first sees a value already returns it and nothing outside React is mutated.
 */
export const useFirstDefined = <T>(candidate: T | undefined): T | undefined => {
  const [frozen, setFrozen] = useState(candidate);
  if (frozen === undefined && candidate !== undefined) {
    setFrozen(candidate);
  }
  return frozen ?? candidate;
};
