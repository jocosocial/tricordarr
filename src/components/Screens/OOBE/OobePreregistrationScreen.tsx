import React from 'react';
import {useConfig} from '../../Context/Contexts/ConfigContext.ts';
import {SiteUIScreenBase} from '../SiteUI/SiteUIScreenBase.tsx';

export const OobePreregistrationScreen = () => {
  const {appConfig} = useConfig();
  return <SiteUIScreenBase initialUrl={appConfig.preRegistrationServerUrl} />;
};
