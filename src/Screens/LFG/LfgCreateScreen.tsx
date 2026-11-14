import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';

import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {LfgCreateScreenBase} from '#src/Screens/LFG/LfgCreateScreenBase';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.lfgCreateScreen>;

export const LfgCreateScreen = ({route}: Props) => {
  const {preRegistrationMode} = usePreRegistration();
  return (
    <PreRegistrationScreen helpScreen={CommonStackComponents.lfgCreateHelpScreen} allowed={true}>
      <DisabledFeatureScreen feature={SwiftarrFeature.friendlyfez} urlPath={'/lfg/create'}>
        <LfgCreateScreenBase
          cruiseDay={route.params?.cruiseDay}
          // Pre-registration users can't add other users.
          initialUserHeaders={preRegistrationMode ? undefined : route.params?.initialUserHeaders}
          title={route.params?.title}
          info={route.params?.info}
          fezType={route.params?.fezType}
          maxCapacity={route.params?.maxCapacity}
        />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};
