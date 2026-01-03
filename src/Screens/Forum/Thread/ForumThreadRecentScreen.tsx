import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ForumThreadsRelationsView} from '#src/Components/Views/Forum/ForumThreadsRelationsView';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {ForumRelationQueryType} from '#src/Queries/Forum/ForumThreadRelationQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';

export const ForumThreadRecentScreen = () => {
  return (
    <LoggedInScreen>
      <PreRegistrationScreen helpScreen={CommonStackComponents.forumHelpScreen}>
        <DisabledFeatureScreen feature={SwiftarrFeature.forums} urlPath={'/forum/recent'}>
          <AppView>
            <ForumThreadsRelationsView relationType={ForumRelationQueryType.recent} />
          </AppView>
        </DisabledFeatureScreen>
      </PreRegistrationScreen>
    </LoggedInScreen>
  );
};
