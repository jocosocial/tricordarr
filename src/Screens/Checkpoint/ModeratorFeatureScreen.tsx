import {PropsWithChildren} from 'react';

import {NotModeratorView} from '#src/Components/Views/Static/NotModeratorView';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';

/**
 * Logged-in, not pre-registration, moderator-only wrapper used by native moderation screens.
 */
export const ModeratorFeatureScreen = ({children}: PropsWithChildren) => {
  return (
    <LoggedInScreen>
      <PreRegistrationScreen helpScreen={CommonStackComponents.moderatorHelpScreen}>
        <ModeratorFeatureScreenInner>{children}</ModeratorFeatureScreenInner>
      </PreRegistrationScreen>
    </LoggedInScreen>
  );
};

/**
 * Checkpoint to ensure the current user has moderator privileges.
 */
const ModeratorFeatureScreenInner = ({children}: PropsWithChildren) => {
  const {hasModerator} = usePrivilege();
  if (!hasModerator) {
    return <NotModeratorView />;
  }
  return children;
};
