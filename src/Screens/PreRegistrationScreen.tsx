import React, {PropsWithChildren} from 'react';

import {PreRegistrationView} from '#src/Components/Views/Static/PreRegistrationView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';

export const PreRegistrationScreen = (props: PropsWithChildren) => {
  const {appConfig} = useConfig();

  if (appConfig.preRegistrationMode) {
    return <PreRegistrationView />;
  }

  return props.children;
};
