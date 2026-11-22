import React from 'react';

import {useDrawer} from '#src/Context/Contexts/DrawerContext';

/**
 * Default `headerLeft` back button on Android, replacing the stock React Navigation one whose hardcoded
 * margins leave the icon off-center in its press area. Reuses the drawer's back button so the header
 * layout, and therefore the title position, matches screens that show the drawer icon.
 */
export const DefaultHeaderBackButton = () => {
  const {getLeftBackHeaderButtons} = useDrawer();
  return <>{getLeftBackHeaderButtons()}</>;
};
