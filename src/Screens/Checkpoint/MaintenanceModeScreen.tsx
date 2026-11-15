import {PropsWithChildren} from 'react';

import {MaintenanceModeView} from '#src/Components/Views/Static/MaintenanceModeView';
import {useMaintenanceBlocked} from '#src/Hooks/useMaintenanceBlocked';

/**
 * Checkpoint to ensure the server isn't in maintenance mode for the current user. If logged
 * in, blocks when the user's access level doesn't meet the server's minimum. If logged out,
 * blocks whenever the server is restricting access at all.
 */
export const MaintenanceModeScreen = ({children}: PropsWithChildren) => {
  const blocked = useMaintenanceBlocked();

  if (blocked) {
    return <MaintenanceModeView />;
  }
  return children;
};
