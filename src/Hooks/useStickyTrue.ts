import {useState} from 'react';

/**
 * Returns true once `condition` has been true on any render, and keeps returning true after that.
 *
 * The latch is React state updated during render (the "adjust state while rendering" pattern), so
 * the render that first sees the condition already returns true and nothing outside React is mutated.
 */
export const useStickyTrue = (condition: boolean): boolean => {
  const [latched, setLatched] = useState(condition);
  if (condition && !latched) {
    setLatched(true);
  }
  return latched || condition;
};
