import React from 'react';
import {useConfig} from '#src/Context/Contexts/ConfigContext.ts';
import {SiteUIScreenBase} from '#src/Screens/SiteUI/SiteUIScreenBase.tsx';

export const OobePreregistrationScreen = () => {
  const {appConfig} = useConfig();
  return <SiteUIScreenBase initialUrl={appConfig.preRegistrationServerUrl} oobe={true} />;
};
