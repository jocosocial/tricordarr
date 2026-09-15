import React from 'react';

import {BaseWarningView} from '#src/Components/Views/Warnings/BaseWarningView';
import {useOobe} from '#src/Context/Contexts/OobeContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {OobeStackComponents} from '#src/Navigation/Stacks/Oobe/OobeStackComponents';
import {RootStackComponents, useRootStack} from '#src/Navigation/Stacks/Root/RootStackComponents';

/**
 * Banner shown during pre-registration. Long-press returns to the onboarding flow once setup is complete.
 */
export const PreRegistrationWarningView = () => {
  const navigation = useRootStack();
  const {oobeCompleted} = useOobe();
  const {commonStyles} = useStyles();

  const onPress = () => {
    navigation.replace(RootStackComponents.oobeNavigator, {
      screen: OobeStackComponents.oobePreregistrationScreen,
      params: {intent: 'onboarding'},
    });
  };

  return (
    <BaseWarningView
      variant={'neutral'}
      title={'Pre-Registration Mode'}
      message={
        oobeCompleted
          ? 'Press and hold here when you are physically on the ship.'
          : 'Complete setup to start using Twitarr.'
      }
      messageVariant={'labelMedium'}
      onLongPress={onPress}
      disabled={!oobeCompleted}
      containerStyle={commonStyles.paddingHorizontalSmall}
    />
  );
};
