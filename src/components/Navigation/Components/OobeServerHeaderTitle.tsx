import React from 'react';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {SecretHeaderTitle} from './SecretHeaderTitle';
import {useRootStack} from '../Stacks/RootStackNavigator';
import {RootStackComponents} from '../../../libraries/Enums/Navigation';

export const OobeServerHeaderTitle = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const rootNavigation = useRootStack();

  const onReveal = () => {
    updateAppConfig({
      ...appConfig,
      oobeCompletedVersion: appConfig.oobeExpectedVersion,
    });
    rootNavigation.replace(RootStackComponents.rootContentScreen);
  };

  return <SecretHeaderTitle title={'Server URL'} onReveal={onReveal} />;
};
