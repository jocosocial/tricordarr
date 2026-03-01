import {CommonActions, useNavigation} from '@react-navigation/native';
import {useCallback} from 'react';

interface ScrollToTopFilter {
  key: string;
  value: unknown;
}

/**
 * Returns a function that dispatches a scrollToTopIntent param update
 * to one or more named screens in the current navigator's stack.
 * Routes not found in the stack are silently skipped.
 *
 * An optional filter object can be passed as the last argument to only
 * dispatch when the target route's params match {key: value}.
 */
export const useScrollToTopIntent = () => {
  const navigation = useNavigation();

  return useCallback(
    (...args: (string | ScrollToTopFilter)[]) => {
      const state = navigation.getState();
      const timestamp = Date.now();

      const lastArg = args[args.length - 1];
      const filter = typeof lastArg === 'object' ? (lastArg as ScrollToTopFilter) : undefined;
      const screenNames = args.filter((a): a is string => typeof a === 'string');

      for (const screenName of screenNames) {
        const route = state?.routes.find(r => r.name === screenName);
        if (!route) continue;

        if (filter) {
          const params = (route.params ?? {}) as Record<string, unknown>;
          if (params[filter.key] !== filter.value) continue;
        }

        navigation.dispatch({
          ...CommonActions.setParams({scrollToTopIntent: timestamp}),
          source: route.key,
        });
      }
    },
    [navigation],
  );
};
