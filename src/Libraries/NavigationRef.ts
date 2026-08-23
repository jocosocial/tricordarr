import {CommonActions, createNavigationContainerRef, StackActions} from '@react-navigation/native';

import {createLogger} from '#src/Libraries/Logger';
import {RootStackParamList} from '#src/Navigation/Stacks/Root/RootStackComponents';

const logger = createLogger('NavigationRef.ts');

/**
 * Global navigation ref attached to NavigationContainer.
 *
 * Use this (and the helpers below) from code that is not inside a nested
 * stack: LinkingProvider, Paper Portal hosts (AppModal, menus), etc.
 * useNavigation / useCommonStack in those portals talk to the root stack.
 * See docs/Navigation.md.
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
 * Go back in the currently focused nested navigator.
 * Safe to call from Paper portals; unlike useNavigation().goBack() in a
 * portal, this does not pop the root stack.
 */
export const goBack = (): void => {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  } else {
    logger.warn('Navigation not ready or cannot go back');
  }
};

/**
 * Pop `count` screens from the currently focused stack navigator.
 * Dispatched through navigationRef so it targets the focused nested stack
 * rather than the root container. No-op (with a warning) if navigation is not ready.
 *
 * @param count Number of screens to pop; defaults to 1.
 */
export const pop = (count = 1): void => {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.pop(count));
  } else {
    logger.warn('Navigation not ready, cannot pop');
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
 * Pop enough screens in the nested stack that contains `name` to land on the
 * screen before it. Searches focused navigators first, then the rest of the
 * tree. If `params` is given, the route must match those param values
 * (e.g. `{eventID}` so a different Personal Event is not popped).
 *
 * Falls back to {@link goBack} if navigation is not ready, the screen is
 * missing, or it is the first route in its stack (nothing to pop past).
 *
 * @param name Route name, typically a CommonStackComponents value.
 * @param params Optional param values that must all match the target route.
 */
export const popPastScreen = (name: string, params?: Record<string, unknown>): void => {
  if (!navigationRef.isReady()) {
    logger.warn('Navigation not ready, cannot popPastScreen', name);
    return;
  }

  const found = findStackContaining(navigationRef.getRootState(), route => {
    if (route.name !== name) {
      return false;
    }
    if (!params) {
      return true;
    }
    const routeParams = (route.params ?? {}) as Record<string, unknown>;
    return Object.entries(params).every(([key, value]) => routeParams[key] === value);
  });

  if (!found || found.routeIndex <= 0 || !found.stackState.key) {
    goBack();
    return;
  }

  navigationRef.dispatch({
    ...StackActions.pop(found.stackState.index - found.routeIndex + 1),
    target: found.stackState.key,
  });
};

/**
 * Dispatch setParams to a route identified by its React Navigation `key`,
 * anywhere in the nested tree. Used by useScrollToTopIntent so a modal can
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

/**
 * Find the navigator state whose `routes` array contains a matching screen,
 * preferring the focused child at each level. Returns that stack's key/index
 * and the matching route's index so the caller can pop past it.
 */
const findStackContaining = (
  state: WalkableState | undefined,
  predicate: (route: WalkableRoute) => boolean,
): {stackState: {key: string; index: number}; routeIndex: number} | undefined => {
  if (!state?.routes) {
    return undefined;
  }

  const routeIndex = state.routes.findIndex(predicate);
  if (routeIndex >= 0 && state.key !== undefined && state.index !== undefined) {
    return {stackState: {key: state.key, index: state.index}, routeIndex};
  }

  const focusedIndex = state.index;
  if (focusedIndex !== undefined) {
    const focused = findStackContaining(state.routes[focusedIndex]?.state, predicate);
    if (focused) {
      return focused;
    }
  }

  for (let i = 0; i < state.routes.length; i++) {
    if (i === focusedIndex) {
      continue;
    }
    const found = findStackContaining(state.routes[i].state, predicate);
    if (found) {
      return found;
    }
  }

  return undefined;
};
