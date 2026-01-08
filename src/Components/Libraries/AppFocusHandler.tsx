import {focusManager} from '@tanstack/react-query';
import {useEffect} from 'react';
import {AppState, AppStateStatus} from 'react-native';

import {isNative} from '#src/Libraries/Platform/Detection';

/**
 * Callback function to handle app state changes.
 * @param status AppStateStatus (comes from React Native)
 */
function onAppStateChange(status: AppStateStatus) {
  if (isNative) {
    console.log('[AppFocusHandler.tsx] onAppStateChange setting focused', status);
    focusManager.setFocused(status === 'active');
  }
}

/**
 * Component to handle focus changes within React Query. Could probably be used elsewhere.
 * This feeds into React Query to make refetchOnWindowFocus function in a React-Native world.
 */
export const AppFocusHandler = () => {
  useEffect(() => {
    console.log('[AppFocusHandler.tsx] useEffect adding app state change listener');
    const subscription = AppState.addEventListener('change', onAppStateChange);
    return () => subscription.remove();
  }, []);

  return null;
};
