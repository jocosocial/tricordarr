/**
 * Optional route params for screens that don't need the drawer.
 * This can be paired with getLeftBackHeaderButtons from the DrawerContext.
 */
export type NoDrawerParamsOptional =
  | undefined
  | {
      noDrawer: boolean;
    };
