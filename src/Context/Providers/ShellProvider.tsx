import {PropsWithChildren} from 'react';
import {Portal} from 'react-native-paper';

import {DrawerProvider} from '#src/Context/Providers/DrawerProvider';
import {LayoutProvider} from '#src/Context/Providers/LayoutProvider';
import {MenuProvider} from '#src/Context/Providers/MenuProvider';
import {ModalProvider} from '#src/Context/Providers/ModalProvider';
import {SnackbarProvider} from '#src/Context/Providers/SnackbarProvider';

/**
 * "Shell" is all of the major UI components such as Drawer, Layout, Menus, etc.
 * Bluesky has a similar concept.
 *
 * SnackbarProvider and ModalProvider must be outside of Portal.Host.
 */
export const ShellProvider = ({children}: PropsWithChildren) => {
  return (
    <LayoutProvider>
      <DrawerProvider>
        <MenuProvider>
          <SnackbarProvider>
            <ModalProvider>
              <Portal.Host>{children}</Portal.Host>
            </ModalProvider>
          </SnackbarProvider>
        </MenuProvider>
      </DrawerProvider>
    </LayoutProvider>
  );
};
