import React from 'react';

import {SecretHeaderTitle} from '#src/Components/Navigation/SecretHeaderTitle';
import {useOobe} from '#src/Context/Contexts/OobeContext';
import {MainStackComponents} from '#src/Navigation/Stacks/MainStackNavigator';
import {RootStackComponents, useRootStack} from '#src/Navigation/Stacks/RootStackNavigator';
import {BottomTabComponents} from '#src/Navigation/Tabs/BottomTabNavigator';

export const OobeServerHeaderTitle = () => {
  const {oobeFinish} = useOobe();
  const rootNavigation = useRootStack();

  const onReveal = () => {
    oobeFinish();
    rootNavigation.replace(RootStackComponents.rootContentScreen, {
      screen: BottomTabComponents.homeTab,
      params: {
        screen: MainStackComponents.mainScreen,
      },
    });
  };

  return <SecretHeaderTitle title={'Server URL'} onReveal={onReveal} />;
};
