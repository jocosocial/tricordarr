import {SecretHeaderTitle} from './SecretHeaderTitle';
import React from 'react';
import {useConfig} from '../../Context/Contexts/ConfigContext';

export const TodayHeaderTitle = () => {
  const {appConfig, updateAppConfig} = useConfig();

  const onReveal = () => {
    updateAppConfig({
      ...appConfig,
      enableEasterEgg: !appConfig.enableEasterEgg,
    });
  };
  return <SecretHeaderTitle title={'Today'} onReveal={onReveal} triggerCount={10} />;
};
