import React from 'react';

import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {ForumPostScreenBase} from '#src/Screens/Forum/Post/ForumPostScreenBase';

export const ForumPostMentionScreen = () => {
  return (
    <PreRegistrationScreen helpScreen={CommonStackComponents.forumThreadHelpScreen}>
      <DisabledFeatureScreen feature={SwiftarrFeature.forums} urlPath={'/forumpost/mentions'}>
        <ForumPostScreenBase refreshOnUserNotification={true} queryParams={{mentionself: true}} />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};
