import React from 'react';

import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {LfgListScreen} from '#src/Screens/LFG/LfgListScreen';

export const LfgFormerScreen = () => {
  return (
    <LoggedInScreen>
      <PreRegistrationScreen helpScreen={CommonStackComponents.lfgHelpScreen}>
        <DisabledFeatureScreen feature={SwiftarrFeature.friendlyfez} urlPath={'/lfg/former'}>
          <LfgListScreen endpoint={'former'} enableFilters={false} enableReportOnly={true} showFab={false} />
        </DisabledFeatureScreen>
      </PreRegistrationScreen>
    </LoggedInScreen>
  );
};
