import React, {useEffect, useState, useCallback} from 'react';
import {RefreshControl, ScrollView, View} from 'react-native';
import {DataTable, useTheme} from 'react-native-paper';
import NetInfo, {useNetInfo} from '@react-native-community/netinfo';
import {AppView} from '../../Views/AppView';

export const NetworkInfoSettings = ({route, navigation}) => {
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const data = useNetInfo();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    NetInfo.refresh().finally(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    navigation.setOptions({title: route.params.title});
  }, [navigation, route.params.title]);

  return (
    <AppView>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={{backgroundColor: theme.colors.background}}>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Key</DataTable.Title>
              <DataTable.Title>Value</DataTable.Title>
            </DataTable.Header>
            {Object.keys(data.details ?? []).map(key => (
              <DataTable.Row key={key}>
                <DataTable.Cell>{key}</DataTable.Cell>
                <DataTable.Cell>{data.details[key].toString()}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </View>
      </ScrollView>
    </AppView>
  );
};
