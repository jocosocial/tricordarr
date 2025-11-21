import React from 'react';

import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {DisabledFeatureScreen} from '#src/Screens/DisabledFeatureScreen';
import {ForumPostScreenBase} from '#src/Screens/Forum/Post/ForumPostScreenBase';

export const ForumPostFavoriteScreen = () => {
  return (
    <DisabledFeatureScreen feature={SwiftarrFeature.forums} urlPath={'/forumpost/favorite'}>
      <ForumPostScreenBase refreshOnUserNotification={true} queryParams={{bookmarked: true}} />
    </DisabledFeatureScreen>
  );
};
