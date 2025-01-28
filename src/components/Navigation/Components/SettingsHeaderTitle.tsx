import React from 'react';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {SecretHeaderTitle} from './SecretHeaderTitle';
import {useSnackbar} from '../../Context/Contexts/SnackbarContext.ts';

/**
 * Header title for the SettingsScreen. This has a secret feature to enable/disable the menu of developer
 * options in the Settings. Those are useful for rectal use only.
 */
export const SettingsHeaderTitle = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const {setSnackbarPayload} = useSnackbar();

  const onReveal = () => {
    updateAppConfig({
      ...appConfig,
      enableDeveloperOptions: !appConfig.enableDeveloperOptions,
    });
    setSnackbarPayload({
      message: `Developer options are now ${!appConfig.enableDeveloperOptions ? 'enabled' : 'disabled'}`,
      messageType: 'info',
    });
  };

  return <SecretHeaderTitle title={'Settings'} onReveal={onReveal} />;
};
