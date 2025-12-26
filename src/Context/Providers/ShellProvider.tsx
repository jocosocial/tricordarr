import {PropsWithChildren} from 'react';

import {DrawerProvider} from '#src/Context/Providers/DrawerProvider';
import {LayoutProvider} from '#src/Context/Providers/LayoutProvider';
import {MenuProvider} from '#src/Context/Providers/MenuProvider';

/**
 * "Shell" is all of the major UI components such as Drawer, Layout, Menus, etc.
 * Bluesky has a similar concept.
 */
export const ShellProvider = ({children}: PropsWithChildren) => {
  return (
    <LayoutProvider>
      <DrawerProvider>
        <MenuProvider>{children}</MenuProvider>
      </DrawerProvider>
    </LayoutProvider>
  );
};
