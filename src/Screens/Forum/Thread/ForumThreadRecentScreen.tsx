import React from 'react';

import {AppView} from '#src/Components/Views/AppView';
import {ForumThreadsRelationsView} from '#src/Components/Views/Forum/ForumThreadsRelationsView';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {ForumRelationQueryType} from '#src/Queries/Forum/ForumThreadRelationQueries';
import {DisabledFeatureScreen} from '#src/Screens/DisabledFeatureScreen';

export const ForumThreadRecentScreen = () => {
  return (
    <DisabledFeatureScreen feature={SwiftarrFeature.forums} urlPath={'/forum/recent'}>
      <AppView>
        <ForumThreadsRelationsView relationType={ForumRelationQueryType.recent} />
      </AppView>
    </DisabledFeatureScreen>
  );
};
