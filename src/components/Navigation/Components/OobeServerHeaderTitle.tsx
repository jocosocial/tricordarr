import React from 'react';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {SecretHeaderTitle} from './SecretHeaderTitle';
import {RootStackComponents, useRootStack} from '../Stacks/RootStackNavigator';
import {BottomTabComponents, MainStackComponents} from '../../../libraries/Enums/Navigation';

export const OobeServerHeaderTitle = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const rootNavigation = useRootStack();

  const onReveal = () => {
    updateAppConfig({
      ...appConfig,
      oobeCompletedVersion: appConfig.oobeExpectedVersion,
    });
    rootNavigation.replace(RootStackComponents.rootContentScreen, {
      screen: BottomTabComponents.homeTab,
      params: {
        screen: MainStackComponents.mainScreen,
      },
    });
  };

  return <SecretHeaderTitle title={'Server URL'} onReveal={onReveal} />;
};
