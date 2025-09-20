import React from 'react';
import {ForumRelationQueryType} from '#src/Queries/Forum/ForumThreadRelationQueries';
import {ForumThreadsRelationsView} from '#src/Components/Views/Forum/ForumThreadsRelationsView';
import {AppView} from '#src/Components/Views/AppView';

export const ForumThreadRecentScreen = () => {
  return (
    <AppView>
      <ForumThreadsRelationsView relationType={ForumRelationQueryType.recent} />
    </AppView>
  );
};
