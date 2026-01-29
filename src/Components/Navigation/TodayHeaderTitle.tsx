import React from 'react';

import {SecretHeaderTitle} from '#src/Components/Navigation/SecretHeaderTitle';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';

export const TodayHeaderTitle = () => {
  const navigation = useCommonStack();

  const onReveal = () => {
    navigation.push(CommonStackComponents.easterEggScreen);
  };
  return <SecretHeaderTitle title={'Today'} onReveal={onReveal} triggerCount={5} />;
};
