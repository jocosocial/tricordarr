import {SecretHeaderTitle} from './SecretHeaderTitle';
import React from 'react';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';

export const TodayHeaderTitle = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const {setInfoMessage} = useErrorHandler();

  const onReveal = () => {
    updateAppConfig({
      ...appConfig,
      enableEasterEgg: !appConfig.enableEasterEgg,
    });
    setInfoMessage(`Easter egg now ${!appConfig.enableEasterEgg ? 'enabled' : 'disabled'}`);
  };
  return <SecretHeaderTitle title={'Today'} onReveal={onReveal} triggerCount={10} />;
};
