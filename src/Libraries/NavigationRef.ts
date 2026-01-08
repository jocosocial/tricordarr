import {createNavigationContainerRef, StackActions} from '@react-navigation/native';

import {RootStackParamList} from '#src/Navigation/Stacks/RootStackNavigator';

/**
 * Global navigation ref that can be used outside of React components.
 * This enables navigation from contexts like TwitarrProvider.
 *
 * https://reactnavigation.org/docs/navigating-without-navigation-prop/
 */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * Check if navigation is ready.
 */
export const isNavigationReady = (): boolean => {
  return navigationRef.isReady();
};

/**
 * Navigate to a screen. Uses navigate() which won't add duplicate screens.
 */
export const navigate = (name: string, params?: object): void => {
  if (navigationRef.isReady()) {
    // @ts-ignore - we're using dynamic screen names
    navigationRef.navigate(name, params);
  } else {
    console.warn('[NavigationRef.ts] Navigation not ready, cannot navigate to', name);
  }
};

/**
 * Push a screen onto the stack. This always adds a new screen.
 */
export const push = (name: string, params?: object): void => {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.push(name, params));
  } else {
    console.warn('[NavigationRef.ts] Navigation not ready, cannot push', name);
  }
};
