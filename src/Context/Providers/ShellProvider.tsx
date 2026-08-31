import {PropsWithChildren} from 'react';
import {Portal} from 'react-native-paper';

import {Lightbox} from '#src/Components/Lightbox';
import {LightboxProvider} from '#src/Components/Lightbox/state';
import {DrawerProvider} from '#src/Context/Providers/DrawerProvider';
import {LayoutProvider} from '#src/Context/Providers/LayoutProvider';
import {MenuProvider} from '#src/Context/Providers/MenuProvider';
import {ShareSheetProvider} from '#src/Context/Providers/ShareSheetProvider';

/**
 * "Shell" is all of the major UI components such as Drawer, Layout, Menus, etc.
 * Bluesky has a similar concept.
 *
 * SnackbarProvider is a dependency of SwiftarrQueryClientProvider so it can't live in here.
 *
 * Lightbox renders after Portal.Host so the image viewer covers Paper menus and dialogs.
 * It also owns its own snackbar: SnackBarBase renders Paper's Snackbar inline rather than
 * through a Portal, so one owned by SnackbarProvider would paint underneath the overlay.
 */
export const ShellProvider = ({children}: PropsWithChildren) => {
  return (
    <LayoutProvider>
      <DrawerProvider>
        <MenuProvider>
          <LightboxProvider>
            <ShareSheetProvider>
              <Portal.Host>{children}</Portal.Host>
              <Lightbox />
            </ShareSheetProvider>
          </LightboxProvider>
        </MenuProvider>
      </DrawerProvider>
    </LayoutProvider>
  );
};
