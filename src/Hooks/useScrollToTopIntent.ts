import {useCallback} from 'react';

import {findRoute, setParamsOnRoute} from '#src/Libraries/NavigationRef';

interface ScrollToTopFilter {
  key: string;
  value: unknown;
}

/**
 * Returns a function that dispatches a scrollToTopIntent param update
 * to one or more named screens anywhere in the nested navigation tree.
 * Routes not found are silently skipped.
 *
 * Uses navigationRef so the target can live in another tab, not only in
 * the caller's nested stack.
 *
 * An optional filter object can be passed as the last argument to only
 * dispatch when the target route's params match {key: value}.
 */
export const useScrollToTopIntent = () => {
  return useCallback((...args: (string | ScrollToTopFilter)[]) => {
    const timestamp = Date.now();

    const lastArg = args[args.length - 1];
    const filter = typeof lastArg === 'object' ? (lastArg as ScrollToTopFilter) : undefined;
    const screenNames = args.filter((a): a is string => typeof a === 'string');

    for (const screenName of screenNames) {
      const route = findRoute(r => {
        if (r.name !== screenName || !r.key) {
          return false;
        }
        if (!filter) {
          return true;
        }
        const params = (r.params ?? {}) as Record<string, unknown>;
        return params[filter.key] === filter.value;
      });
      if (!route?.key) {
        continue;
      }

      setParamsOnRoute(route.key, {scrollToTopIntent: timestamp});
    }
  }, []);
};
