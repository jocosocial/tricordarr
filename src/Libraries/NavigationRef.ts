import {CommonActions, createNavigationContainerRef, StackActions} from '@react-navigation/native';

import {createLogger} from '#src/Libraries/Logger';
import {RootStackParamList} from '#src/Navigation/Stacks/Root/RootStackComponents';

const logger = createLogger('NavigationRef.ts');

/**
 * Global navigation ref attached to NavigationContainer.
 *
 * Use this (and the helpers below) from code that is not inside a nested
 * stack: LinkingProvider, CallProvider, NotificationDataListener, and
 * cross-tab param updates (useScrollToTopIntent).
 * useNavigation / useCommonStack in Paper portals talk to the root stack.
 * Screens, headers, and Alert.alert callbacks in those parents should use
 * stack hooks instead. See docs/Navigation.md.
 *
 * https://reactnavigation.org/docs/navigating-without-navigation-prop/
 */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

interface WalkableRoute {
  name: string;
  key?: string;
  params?: object;
  state?: WalkableState;
}

interface WalkableState {
  key?: string;
  index?: number;
  routes?: WalkableRoute[];
}

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
    logger.warn('Navigation not ready, cannot navigate to', name);
  }
};

/**
 * Push a screen onto the stack. This always adds a new screen.
 */
export const push = (name: string, params?: object): void => {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.push(name, params));
  } else {
    logger.warn('Navigation not ready, cannot push', name);
  }
};

/**
 * Walk the nested navigation tree (root state) and return the first route
 * whose predicate returns true. Used to locate screens that are not in the
 * current navigator's direct `routes` array (other tabs, nested stacks).
 * Returns undefined if navigation is not ready or no route matches.
 *
 * @param predicate Called with each route in depth-first order.
 */
export const findRoute = (predicate: (route: WalkableRoute) => boolean): WalkableRoute | undefined => {
  if (!navigationRef.isReady()) {
    return undefined;
  }
  return findRouteInState(navigationRef.getRootState(), predicate);
};

/**
 * Dispatch setParams to a route identified by its React Navigation `key`,
 * anywhere in the nested tree. Used by useScrollToTopIntent so a caller can
 * update a list screen in another tab. No-op (with a warning) if navigation
 * is not ready; the caller is responsible for resolving `routeKey` first.
 *
 * @param routeKey `route.key` from {@link findRoute} or getState().
 * @param params Params to merge onto that route (e.g. `{scrollToTopIntent}`).
 */
export const setParamsOnRoute = (routeKey: string, params: object): void => {
  if (!navigationRef.isReady()) {
    logger.warn('Navigation not ready, cannot setParamsOnRoute');
    return;
  }
  navigationRef.dispatch({
    ...CommonActions.setParams(params),
    source: routeKey,
  });
};

/**
 * Depth-first search of a walkable navigation state for the first matching route.
 */
const findRouteInState = (
  state: WalkableState | undefined,
  predicate: (route: WalkableRoute) => boolean,
): WalkableRoute | undefined => {
  if (!state?.routes) {
    return undefined;
  }
  for (const route of state.routes) {
    if (predicate(route)) {
      return route;
    }
    const nested = findRouteInState(route.state, predicate);
    if (nested) {
      return nested;
    }
  }
  return undefined;
};
