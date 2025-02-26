import React from 'react';
import {AppView} from '../../Views/AppView.tsx';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import {useMenusQuery} from '../../Queries/Navigator/DiningQueries.ts';
import {RefreshControl} from 'react-native';
import {Text} from 'react-native-paper';
import {LoadingView} from '../../Views/Static/LoadingView.tsx';

export const DiningScreen = () => {
  const {data, refetch, isFetching} = useMenusQuery();

  if (!data) {
    return <LoadingView />;
  }

  // console.log(data.results.map());
  data.results.map(r => {
    console.log(r.state);
  });

  return (
    <AppView>
      <ScrollingContentView refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}>
        {data.results.map(result => {
          return <Text>{result.name}</Text>;
        })}
      </ScrollingContentView>
    </AppView>
  );
};
