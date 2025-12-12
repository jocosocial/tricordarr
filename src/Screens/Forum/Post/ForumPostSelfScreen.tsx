import React from 'react';

import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {DisabledFeatureScreen} from '#src/Screens/DisabledFeatureScreen';
import {ForumPostScreenBase} from '#src/Screens/Forum/Post/ForumPostScreenBase';
import {PreRegistrationScreen} from '#src/Screens/PreRegistrationScreen';

export const ForumPostSelfScreen = () => {
  return (
    <PreRegistrationScreen>
      <DisabledFeatureScreen feature={SwiftarrFeature.forums} urlPath={'/forumpost/owned'}>
        <ForumPostScreenBase refreshOnUserNotification={true} queryParams={{byself: true}} />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};
