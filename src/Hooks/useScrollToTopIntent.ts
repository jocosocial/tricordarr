import {CommonActions, useNavigation} from '@react-navigation/native';
import {useCallback} from 'react';

/**
 * Returns a function that dispatches a scrollToTopIntent param update
 * to one or more named screens in the current navigator's stack.
 * Routes not found in the stack are silently skipped.
 */
export const useScrollToTopIntent = () => {
  const navigation = useNavigation();

  return useCallback(
    (...screenNames: string[]) => {
      const state = navigation.getState();
      const timestamp = Date.now();
      for (const screenName of screenNames) {
        const route = state?.routes.find(r => r.name === screenName);
        if (route) {
          navigation.dispatch({
            ...CommonActions.setParams({scrollToTopIntent: timestamp}),
            source: route.key,
          });
        }
      }
    },
    [navigation],
  );
};
