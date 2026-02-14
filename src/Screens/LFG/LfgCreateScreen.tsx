import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';

import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {LfgStackComponents, LfgStackParamList} from '#src/Navigation/Stacks/LFGStackNavigator';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {LfgCreateScreenBase} from '#src/Screens/LFG/LfgCreateScreenBase';

type Props = StackScreenProps<LfgStackParamList, LfgStackComponents.lfgCreateScreen>;

export const LfgCreateScreen = ({route}: Props) => {
  return (
    <PreRegistrationScreen helpScreen={CommonStackComponents.lfgCreateHelpScreen}>
      <DisabledFeatureScreen feature={SwiftarrFeature.friendlyfez} urlPath={'/lfg/create'}>
        <LfgCreateScreenBase cruiseDay={route.params?.cruiseDay} />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};
