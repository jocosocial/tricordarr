import {focusManager} from '@tanstack/react-query';
import {useEffect} from 'react';
import {AppState, AppStateStatus} from 'react-native';

import {createLogger} from '#src/Libraries/Logger';
import {isNative} from '#src/Libraries/Platform/Detection';

const logger = createLogger('AppFocusHandler.tsx');

/**
 * Callback function to handle app state changes.
 * @param status AppStateStatus (comes from React Native)
 */
function onAppStateChange(status: AppStateStatus) {
  if (isNative) {
    logger.debug('onAppStateChange setting focused', status);
    focusManager.setFocused(status === 'active');
  }
}

/**
 * Component to handle focus changes within React Query. Could probably be used elsewhere.
 * This feeds into React Query to make refetchOnWindowFocus function in a React-Native world.
 */
export const AppFocusHandler = () => {
  useEffect(() => {
    logger.debug('useEffect adding app state change listener');
    const subscription = AppState.addEventListener('change', onAppStateChange);
    return () => subscription.remove();
  }, []);

  return null;
};
