import React from 'react';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';
import {SecretHeaderTitle} from './SecretHeaderTitle';

/**
 * Header title for the SettingsScreen. This has a secret feature to enable/disable the menu of developer
 * options in the Settings. Those are useful for rectal use only.
 */
export const SettingsHeaderTitle = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const {setInfoMessage} = useErrorHandler();

  const onReveal = () => {
    updateAppConfig({
      ...appConfig,
      enableDeveloperOptions: !appConfig.enableDeveloperOptions,
    });
    setInfoMessage(`Developer options are now ${!appConfig.enableDeveloperOptions ? 'enabled' : 'disabled'}`);
  };

  return <SecretHeaderTitle title={'Settings'} onReveal={onReveal} />;
};
