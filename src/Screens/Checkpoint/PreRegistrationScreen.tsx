import React, {PropsWithChildren} from 'react';

import {PreRegistrationView} from '#src/Components/Views/Static/PreRegistrationView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {HelpScreenComponents} from '#src/Navigation/CommonScreens';

interface PreRegistrationScreenProps extends PropsWithChildren {
  helpScreen?: HelpScreenComponents;
}

export const PreRegistrationScreen = (props: PreRegistrationScreenProps) => {
  const {appConfig} = useConfig();

  if (appConfig.preRegistrationMode) {
    return <PreRegistrationView helpScreen={props.helpScreen} />;
  }

  return props.children;
};
