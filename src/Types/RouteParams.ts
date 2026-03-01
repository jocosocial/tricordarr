/**
 * Generic type for route params that support intent-based navigation.
 * Intent is a unique string (action_epochSeconds) that triggers one-time effects.
 */
export type WithIntent<TParams = Optional<{}>, TIntent = string> = TParams & {
  intent?: TIntent;
};

/**
 * Generic type for route params that support scroll-to-top intent.
 * A numeric timestamp that triggers a one-time scroll-to-top effect via useEffect.
 */
export type WithScrollToTopIntent<T = {}> = T & {
  scrollToTopIntent?: number;
};

/**
 * Route params specific to ScheduleDayScreen.
 */
export type ScheduleDayParams = WithIntent<{
  cruiseDay?: number;
  setPersonalFilter?: boolean;
  onlyNew?: boolean;
}>;

/**
 * Optional route params for screens that don't need the drawer.
 * This can be paired with getLeftBackHeaderButtons from the DrawerContext.
 */
export type NoDrawerParams = {
  noDrawer?: boolean;
};

/**
 * Generic type for optional route params.
 */
export type Optional<T> = T | undefined;
