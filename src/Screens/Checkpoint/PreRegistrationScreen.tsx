import React, {PropsWithChildren} from 'react';

import {PreRegistrationView} from '#src/Components/Views/Static/PreRegistrationView';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {HelpScreenComponents} from '#src/Navigation/CommonScreens';

interface PreRegistrationScreenProps extends PropsWithChildren {
  helpScreen?: HelpScreenComponents;
}

export const PreRegistrationScreen = (props: PreRegistrationScreenProps) => {
  const {preRegistrationMode} = usePreRegistration();

  if (preRegistrationMode) {
    return <PreRegistrationView helpScreen={props.helpScreen} />;
  }

  return props.children;
};
