import React from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {useLfgListQuery} from '../../Queries/Fez/FezQueries';

export const LfgOwnedScreen = () => {
  const {data} = useLfgListQuery({endpoint: 'owner'});
  return (
    <AppView>
      <ScrollingContentView />
    </AppView>
  );
};
