import React from 'react';
import {ForumRelationQueryType} from '../../../Queries/Forum/ForumThreadRelationQueries.ts';
import {ForumThreadsRelationsView} from '../../../Views/Forum/ForumThreadsRelationsView.tsx';
import {AppView} from '../../../Views/AppView.tsx';

export const ForumThreadRecentScreen = () => {
  return (
    <AppView>
      <ForumThreadsRelationsView relationType={ForumRelationQueryType.recent} />
    </AppView>
  );
};
