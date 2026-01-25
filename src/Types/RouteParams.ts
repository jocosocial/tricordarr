/**
 * Generic type for route params that support intent-based navigation.
 * Intent is a unique string (action_epochSeconds) that triggers one-time effects.
 */
export type WithIntent<T = {}> = T & {
  intent?: string;
};

/**
 * Route params specific to ScheduleDayScreen.
 */
export type ScheduleDayParams = {
  cruiseDay?: number;
  setPersonalFilter?: boolean;
};

/**
 * Optional route params for screens that don't need the drawer.
 * This can be paired with getLeftBackHeaderButtons from the DrawerContext.
 */
export type NoDrawerParamsOptional =
  | undefined
  | {
      noDrawer?: boolean;
    };
