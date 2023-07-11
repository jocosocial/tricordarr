import React, {PropsWithChildren} from 'react';
import {DrawerContext} from '../Contexts/DrawerContext';
import {AppDrawer} from '../../Drawers/AppDrawer';

export const DrawerProvider = ({children}: PropsWithChildren) => {
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  return (
    <DrawerContext.Provider value={{drawerOpen, setDrawerOpen}}>
      <AppDrawer>{children}</AppDrawer>
    </DrawerContext.Provider>
  );
};
