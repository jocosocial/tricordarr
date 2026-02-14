import React from 'react';

import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {LfgCreateScreenBase} from '#src/Screens/LFG/LfgCreateScreenBase';

export const LfgCreateScreen = () => {
  return (
    <PreRegistrationScreen helpScreen={CommonStackComponents.lfgCreateHelpScreen}>
      <DisabledFeatureScreen feature={SwiftarrFeature.friendlyfez} urlPath={'/lfg/create'}>
        <LfgCreateScreenBase />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};
