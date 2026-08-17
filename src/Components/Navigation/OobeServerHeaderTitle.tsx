import React from 'react';

import {SecretHeaderTitle} from '#src/Components/Navigation/SecretHeaderTitle';
import {useOobe} from '#src/Context/Contexts/OobeContext';
import {MainStackComponents} from '#src/Navigation/Stacks/Main/MainStackComponents';
import {RootStackComponents, useRootStack} from '#src/Navigation/Stacks/Root/RootStackComponents';
import {BottomTabComponents} from '#src/Navigation/Tabs/Bottom/BottomTabComponents';

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
