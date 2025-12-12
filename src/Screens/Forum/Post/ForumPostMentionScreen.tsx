import React from 'react';

import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {DisabledFeatureScreen} from '#src/Screens/DisabledFeatureScreen';
import {ForumPostScreenBase} from '#src/Screens/Forum/Post/ForumPostScreenBase';
import {PreRegistrationScreen} from '#src/Screens/PreRegistrationScreen';

export const ForumPostMentionScreen = () => {
  return (
    <PreRegistrationScreen>
      <DisabledFeatureScreen feature={SwiftarrFeature.forums} urlPath={'/forumpost/mentions'}>
        <ForumPostScreenBase refreshOnUserNotification={true} queryParams={{mentionself: true}} />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};
