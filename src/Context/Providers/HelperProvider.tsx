import {PropsWithChildren} from 'react';

import {AppImageProvider} from '#src/Context/Providers/AppImageProvider';
import {BoardgameDataProvider} from '#src/Context/Providers/BoardgameDataProvider';
import {DayPlannerProvider} from '#src/Context/Providers/DayPlannerProvider';
import {ImageProvider} from '#src/Context/Providers/ImageProvider';
import {ModerationProvider} from '#src/Context/Providers/ModerationProvider';
import {PostDetailDataProvider} from '#src/Context/Providers/PostDetailDataProvider';
import {SelectableProvider} from '#src/Context/Providers/SelectableProvider';
import {UserHeaderProvider} from '#src/Context/Providers/UserHeaderProvider';
import {UserNotificationDataProvider} from '#src/Context/Providers/UserNotificationDataProvider';

/**
 * Groups the app's stateless "helper" contexts - pure derivation/factory functions
 * (module-scope, identity never changes across renders) rather than live app state.
 * See AppImageContext.ts for why these are contexts instead of plain hooks.
 *
 * Deliberately separate from ShellProvider, which is for UI-primitive state (Drawer,
 * Layout, Menus, etc.) - these two groupings have no dependency on each other, which is
 * why HelperProvider wraps ShellProvider in App.tsx rather than nesting inside it.
 */
export const HelperProvider = ({children}: PropsWithChildren) => {
  return (
    <AppImageProvider>
      <DayPlannerProvider>
        <ModerationProvider>
          <SelectableProvider>
            <UserNotificationDataProvider>
              <BoardgameDataProvider>
                <PostDetailDataProvider>
                  <UserHeaderProvider>
                    <ImageProvider>{children}</ImageProvider>
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
