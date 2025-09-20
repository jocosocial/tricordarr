import React from 'react';
import {useConfig} from '../../Context/Contexts/ConfigContext.ts';
import {SecretHeaderTitle} from './SecretHeaderTitle.tsx';
import {RootStackComponents, useRootStack} from '../Stacks/RootStackNavigator.tsx';
import {MainStackComponents} from '../Stacks/MainStackNavigator.tsx';
import {BottomTabComponents} from '../Tabs/BottomTabNavigator.tsx';

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
