import React from 'react';

import {BaseWarningView} from '#src/Components/Views/Warnings/BaseWarningView';
import {useOobe} from '#src/Context/Contexts/OobeContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useDisablePreRegistration} from '#src/Hooks/useDisablePreRegistration';
import {useSecretTrigger} from '#src/Hooks/useSecretTrigger';
import {navigateToBoarding} from '#src/Libraries/Navigation';

/**
 * Banner shown during pre-registration. Long-press starts boarding (the move to the ship's server) once setup is complete.
 * Tapping it 5 times (a hidden shortcut) offers to disable pre-registration mode. Neither works until
 * setup is complete, since the setup flow itself decides pre-registration mode.
 */
export const PreRegistrationWarningView = () => {
  const {oobeCompleted} = useOobe();
  const {commonStyles} = useStyles();
  const {promptDisablePreRegistration, isDisabling} = useDisablePreRegistration();

  const {onPress} = useSecretTrigger({
    onTrigger: () => {
      if (isDisabling) {
        return;
      }
      promptDisablePreRegistration();
    },
  });

  return (
    <BaseWarningView
      variant={'neutral'}
      title={'Pre-Registration Mode'}
      message={
        oobeCompleted
          ? 'Press and hold here when you are physically on the ship.'
          : 'Complete setup to start using Twitarr.'
      }
      onPress={oobeCompleted ? onPress : undefined}
      onLongPress={oobeCompleted ? navigateToBoarding : undefined}
      containerStyle={commonStyles.paddingHorizontalSmall}
    />
  );
};
