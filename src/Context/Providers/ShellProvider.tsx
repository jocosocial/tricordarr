import {PropsWithChildren} from 'react';
import {Portal} from 'react-native-paper';

import {Lightbox} from '#src/Components/Lightbox';
import {LightboxProvider} from '#src/Components/Lightbox/state';
import {AppImageProvider} from '#src/Context/Providers/AppImageProvider';
import {BoardgameDataProvider} from '#src/Context/Providers/BoardgameDataProvider';
import {BottomSheetProvider} from '#src/Context/Providers/BottomSheetProvider';
import {DayPlannerProvider} from '#src/Context/Providers/DayPlannerProvider';
import {DrawerProvider} from '#src/Context/Providers/DrawerProvider';
import {ImageProvider} from '#src/Context/Providers/ImageProvider';
import {LayoutProvider} from '#src/Context/Providers/LayoutProvider';
import {MenuProvider} from '#src/Context/Providers/MenuProvider';
import {ModerationProvider} from '#src/Context/Providers/ModerationProvider';
import {PostDetailDataProvider} from '#src/Context/Providers/PostDetailDataProvider';
import {SelectableProvider} from '#src/Context/Providers/SelectableProvider';
import {UserHeaderProvider} from '#src/Context/Providers/UserHeaderProvider';
import {UserNotificationDataProvider} from '#src/Context/Providers/UserNotificationDataProvider';

/**
 * "Shell" is all of the major UI components such as Drawer, Layout, Menus, etc.
 * Bluesky has a similar concept.
 *
 * SnackbarProvider is a dependency of SwiftarrQueryClientProvider so it can't live in here.
 *
 * Lightbox renders after Portal.Host so the image viewer covers Paper menus and dialogs.
 * It also owns its own snackbar: SnackBarBase renders Paper's Snackbar inline rather than
 * through a Portal, so one owned by SnackbarProvider would paint underneath the overlay.
 *
 * AppImageProvider through UserNotificationDataProvider are all stateless pure-function
 * contexts (module-scope functions, identity never changes across renders) rather than
 * live app state - grouped here as flat siblings since they have no dependency on each
 * other or on anything else in this tree. See AppImageContext.ts for why these are
 * contexts instead of plain hooks.
 */
export const ShellProvider = ({children}: PropsWithChildren) => {
  return (
    <AppImageProvider>
      <DayPlannerProvider>
        <ModerationProvider>
          <SelectableProvider>
            <UserNotificationDataProvider>
              <BoardgameDataProvider>
                <PostDetailDataProvider>
                  <UserHeaderProvider>
                    <ImageProvider>
                      <LayoutProvider>
                        <DrawerProvider>
                          <MenuProvider>
                            <LightboxProvider>
                              <BottomSheetProvider>
                                <Portal.Host>{children}</Portal.Host>
                                <Lightbox />
                              </BottomSheetProvider>
                            </LightboxProvider>
                          </MenuProvider>
                        </DrawerProvider>
                      </LayoutProvider>
                    </ImageProvider>
                  </UserHeaderProvider>
                </PostDetailDataProvider>
              </BoardgameDataProvider>
            </UserNotificationDataProvider>
          </SelectableProvider>
        </ModerationProvider>
      </DayPlannerProvider>
    </AppImageProvider>
  );
};
