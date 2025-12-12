import React from 'react';

import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {DisabledFeatureScreen} from '#src/Screens/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/PreRegistrationScreen';
import {LfgListScreen} from '#src/Screens/LFG/LfgListScreen';

export const LfgFormerScreen = () => {
  return (
    <PreRegistrationScreen>
      <DisabledFeatureScreen feature={SwiftarrFeature.friendlyfez} urlPath={'/lfg/former'}>
        <LfgListScreen endpoint={'former'} enableFilters={false} enableReportOnly={true} showFab={false} />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};
