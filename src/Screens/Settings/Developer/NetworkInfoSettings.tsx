import NetInfo, {useNetInfo} from '@react-native-community/netinfo';
import React, {useCallback, useState} from 'react';
import {RefreshControl, ScrollView, View} from 'react-native';
import {DataTable} from 'react-native-paper';

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
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>NetInfo</DataTable.Title>
            </DataTable.Header>
            {Object.keys(data.details ?? []).map(key => (
              <DataTable.Row key={key}>
                <DataTable.Cell>{key}</DataTable.Cell>
                <DataTable.Cell>
                  {data.details ? data.details[key as keyof typeof data.details].toString() : 'UNKNOWN'}
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </View>
      </ScrollView>
    </AppView>
  );
};
