import {PropsWithChildren} from 'react';
import {Portal} from 'react-native-paper';

import {DrawerProvider} from '#src/Context/Providers/DrawerProvider';
import {LayoutProvider} from '#src/Context/Providers/LayoutProvider';
import {MenuProvider} from '#src/Context/Providers/MenuProvider';
import {ModalProvider} from '#src/Context/Providers/ModalProvider';

/**
 * "Shell" is all of the major UI components such as Drawer, Layout, Menus, etc.
 * Bluesky has a similar concept.
 *
 * SnackbarProvider is a dependency of SwiftarrQueryClientProvider so it can't live in here.
 */
export const ShellProvider = ({children}: PropsWithChildren) => {
  return (
    <LayoutProvider>
      <DrawerProvider>
        <MenuProvider>
          <ModalProvider>
            <Portal.Host>{children}</Portal.Host>
          </ModalProvider>
        </MenuProvider>
      </DrawerProvider>
    </LayoutProvider>
  );
};
