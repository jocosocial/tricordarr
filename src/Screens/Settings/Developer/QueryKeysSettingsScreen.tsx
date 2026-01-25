import {StackScreenProps} from '@react-navigation/stack';
import {FlashList} from '@shopify/flash-list';
import {Query, useQueryClient} from '@tanstack/react-query';
import React, {useCallback, useEffect, useState} from 'react';
import {Divider} from 'react-native-paper';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {QueryCacheListItem} from '#src/Components/Lists/Items/Settings/QueryCacheListItem';
import {AppView} from '#src/Components/Views/AppView';
import {SettingsStackParamList, SettingsStackScreenComponents} from '#src/Navigation/Stacks/SettingsStackNavigator';

export type Props = StackScreenProps<SettingsStackParamList, SettingsStackScreenComponents.queryKeysSettingsScreen>;

export const QueryKeysSettingsScreen = ({navigation}: Props) => {
  const queryClient = useQueryClient();
  const [contents, setContents] = useState<Query[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(() => {
    setRefreshing(true);
    setContents(queryClient.getQueryCache().getAll());
    setRefreshing(false);
  }, [queryClient]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const renderItem = ({item}: {item: Query}) => {
    const onPress = () =>
      navigation.push(SettingsStackScreenComponents.queryDataSettingsScreen, {
        queryHash: item.queryHash,
      });
    return <QueryCacheListItem query={item} onPress={onPress} />;
  };

  const itemSeparator = () => <Divider bold={true} />;

  return (
    <AppView>
      <FlashList
        renderItem={renderItem}
        data={contents}
        refreshControl={<AppRefreshControl onRefresh={refresh} refreshing={refreshing} />}
        ItemSeparatorComponent={itemSeparator}
      />
    </AppView>
  );
};
