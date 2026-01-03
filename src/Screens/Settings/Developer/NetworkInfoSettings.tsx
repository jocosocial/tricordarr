import NetInfo, {useNetInfo} from '@react-native-community/netinfo';
import React, {useCallback, useState} from 'react';
import {ScrollView, View} from 'react-native';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';

export const NetworkInfoSettings = () => {
  const [refreshing, setRefreshing] = useState(false);
  const data = useNetInfo();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    NetInfo.refresh().finally(() => setRefreshing(false));
  }, []);

  return (
    <AppView>
      <ScrollView refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View>
          <ListSubheader>NetInfo</ListSubheader>
          {Object.keys(data.details ?? []).map(key => (
            <DataFieldListItem
              title={key}
              description={data.details ? data.details[key as keyof typeof data.details].toString() : 'UNKNOWN'}
              key={key}
            />
          ))}
        </View>
      </ScrollView>
    </AppView>
  );
};
