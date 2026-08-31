import {PropsWithChildren} from 'react';

import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {ModeratorScreen} from '#src/Screens/Checkpoint/ModeratorScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';

/**
 * Logged-in, not pre-registration, moderator-only wrapper used by native moderation screens.
 */
export const ModeratorFeatureScreen = ({children}: PropsWithChildren) => {
  return (
    <LoggedInScreen>
      <PreRegistrationScreen helpScreen={CommonStackComponents.moderatorHelpScreen}>
        <ModeratorScreen>{children}</ModeratorScreen>
      </PreRegistrationScreen>
    </LoggedInScreen>
  );
};
