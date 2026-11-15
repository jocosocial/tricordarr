import React, {PropsWithChildren} from 'react';

import {PreRegistrationView} from '#src/Components/Views/Static/PreRegistrationView';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {HelpScreenComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';

interface PreRegistrationScreenProps extends PropsWithChildren {
  helpScreen?: HelpScreenComponents;
  /**
   * Render the children even in pre-registration mode. Use this for screens whose endpoints
   * Swiftarr allows during pre-registration (e.g. the user's own LFGs and Private Events).
   */
  allowed?: boolean;
}

/**
 * Checkpoint that replaces its children with the PreRegistrationView while in pre-registration
 * mode, unless the screen is explicitly `allowed`.
 */
export const PreRegistrationScreen = (props: PreRegistrationScreenProps) => {
  const {preRegistrationMode} = usePreRegistration();

  if (preRegistrationMode && !props.allowed) {
    return <PreRegistrationView helpScreen={props.helpScreen} />;
  }

  return props.children;
};
