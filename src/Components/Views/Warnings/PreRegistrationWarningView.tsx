import React from 'react';

import {BaseWarningView} from '#src/Components/Views/Warnings/BaseWarningView';
import {useOobe} from '#src/Context/Contexts/OobeContext';
import {OobeStackComponents} from '#src/Navigation/Stacks/OobeStackNavigator';
import {RootStackComponents, useRootStack} from '#src/Navigation/Stacks/RootStackNavigator';

export const PreRegistrationWarningView = () => {
  const navigation = useRootStack();
  const {oobeCompleted} = useOobe();

  const onPress = () => {
    navigation.replace(RootStackComponents.oobeNavigator, {
      screen: OobeStackComponents.oobePreregistrationScreen,
    });
  };

  return (
    <BaseWarningView
      title={'Pre-Registration Mode'}
      message={
        oobeCompleted
          ? 'Press and hold here when you are physically on the ship.'
          : 'Complete setup to start using Twitarr.'
      }
      onLongPress={onPress}
      disabled={!oobeCompleted}
    />
  );
};
