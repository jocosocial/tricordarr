import React from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {ConductView} from '../../Views/Static/ConductView';
import {useConductQuery} from '../../Queries/PublicQueries';
import {RefreshControl} from 'react-native';
import {LoadingView} from '../../Views/Static/LoadingView';

export const MainConductScreen = () => {
  const {data, refetch, isFetching} = useConductQuery();
  if (!data) {
    return <LoadingView />;
  }
  return (
    <AppView>
      <ScrollingContentView refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}>
        <ConductView docs={[data.guidelines, data.codeofconduct, data.twitarrconduct]} />
      </ScrollingContentView>
    </AppView>
  );
};
