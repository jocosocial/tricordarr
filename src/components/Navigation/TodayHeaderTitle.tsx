import {SecretHeaderTitle} from '#src/Components/Navigation/SecretHeaderTitle';
import React from 'react';
import {useConfig} from '#src/Context/Contexts/ConfigContext';

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
