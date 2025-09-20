import React, {useEffect, useState} from 'react';
import {AppView} from '../../../Views/AppView.tsx';
import {RefreshControl, ScrollView} from 'react-native';
import {Text} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  SettingsStackParamList,
  SettingsStackScreenComponents,
} from '../../../Navigation/Stacks/SettingsStackNavigator.tsx';
import {Query, useQueryClient} from '@tanstack/react-query';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView.tsx';
import JSONTree from 'react-native-json-tree';

export type Props = NativeStackScreenProps<
  SettingsStackParamList,
  SettingsStackScreenComponents.queryDataSettingsScreen
>;

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
