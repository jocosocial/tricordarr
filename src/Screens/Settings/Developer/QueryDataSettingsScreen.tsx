import {StackScreenProps} from '@react-navigation/stack';
import {Query, useQueryClient} from '@tanstack/react-query';
import React, {useEffect, useState} from 'react';
import {RefreshControl, ScrollView} from 'react-native';
import JSONTree from 'react-native-json-tree';
import {Text} from 'react-native-paper';

import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {SettingsStackParamList, SettingsStackScreenComponents} from '#src/Navigation/Stacks/SettingsStackNavigator';

export type Props = StackScreenProps<SettingsStackParamList, SettingsStackScreenComponents.queryDataSettingsScreen>;

export const QueryDataSettingsScreen = ({route}: Props) => {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState<Query>();
  const [refreshing, setRefreshing] = useState(false);

  // const refresh = useCallback(() => {
  //   setRefreshing(true);
  //   const result = queryClient.getQueryCache().get(route.params.queryHash);
  //   setQuery(result);
  //   setRefreshing(false);
  // }, [queryClient, route.params.queryHash]);

  // useEffect(() => {
  //   refresh();
  // }, [refresh]);

  const refresh = async () => {
    setRefreshing(true);
    const result = queryClient.getQueryCache().get(route.params.queryHash);
    setQuery(result);
    setRefreshing(false);
  };

  const refetch = async () => {
    await query?.fetch();
    await refresh();
  };

  useEffect(() => {
    const result = queryClient.getQueryCache().get(route.params.queryHash);
    setQuery(result);
  }, [queryClient, route.params.queryHash]);

  if (!query) {
    return (
      <AppView>
        <PaddedContentView>
          <Text>No Query State</Text>
        </PaddedContentView>
      </AppView>
    );
  }

  return (
    <AppView>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetch} />}>
        <ScrollView horizontal={true}>
          <JSONTree data={query.state as any} hideRoot={true} shouldExpandNode={() => true} />
        </ScrollView>
      </ScrollView>
    </AppView>
  );
};
