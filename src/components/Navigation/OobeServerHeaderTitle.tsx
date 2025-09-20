import React from 'react';
import {useConfig} from '#src/Context/Contexts/ConfigContext.ts';
import {SecretHeaderTitle} from '#src/Navigation/Navigation/SecretHeaderTitle.tsx';
import {RootStackComponents, useRootStack} from '#src/Navigation/Stacks/RootStackNavigator.tsx';
import {MainStackComponents} from '#src/Navigation/Stacks/MainStackNavigator.tsx';
import {BottomTabComponents} from '#src/Navigation/Tabs/BottomTabNavigator.tsx';

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
