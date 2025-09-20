import React from 'react';
import {ForumRelationQueryType} from '#src/Queries/Forum/ForumThreadRelationQueries.ts';
import {ForumThreadsRelationsView} from '#src/Views/Forum/ForumThreadsRelationsView.tsx';
import {AppView} from '#src/Views/AppView.tsx';

export const ForumThreadRecentScreen = () => {
  return (
    <AppView>
      <ForumThreadsRelationsView relationType={ForumRelationQueryType.recent} />
    </AppView>
  );
};
