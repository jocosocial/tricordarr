import {PropsWithChildren} from 'react';

import {NotModeratorView} from '#src/Components/Views/Static/NotModeratorView';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';

/**
 * Checkpoint screen to ensure the current user has moderator privileges.
 */
export const ModeratorScreen = ({children}: PropsWithChildren) => {
  const {hasModerator} = usePrivilege();
  if (!hasModerator) {
    return <NotModeratorView />;
  }
  return children;
};
