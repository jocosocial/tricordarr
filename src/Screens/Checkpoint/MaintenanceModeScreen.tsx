import {PropsWithChildren} from 'react';

import {MaintenanceModeView} from '#src/Components/Views/Static/MaintenanceModeView';
import {useClientSettings} from '#src/Context/Contexts/ClientSettingsContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {UserAccessLevel} from '#src/Enums/UserAccessLevel';

/**
 * Checkpoint to ensure the server isn't in maintenance mode for the current user. If logged
 * in, blocks when the user's access level doesn't meet the server's minimum. If logged out,
 * blocks whenever the server is restricting access at all.
 */
export const MaintenanceModeScreen = ({children}: PropsWithChildren) => {
  const {isAccessRestricted, minAccessLevel} = useClientSettings();
  const {isLoggedIn, currentSession} = useSession();
  const userAccessLevel = currentSession?.tokenData?.accessLevel;

  const blocked =
    isAccessRestricted &&
    (isLoggedIn ? !UserAccessLevel.hasAccess(userAccessLevel ?? UserAccessLevel.unverified, minAccessLevel) : true);

  if (blocked) {
    return <MaintenanceModeView />;
  }
  return children;
};
