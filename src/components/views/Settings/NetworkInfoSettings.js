import React, {useEffect, useState, useCallback} from 'react';
import {RefreshControl, SafeAreaView, ScrollView, View} from 'react-native';
import {DataTable, useTheme} from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
// import {SaveButton} from '../../Buttons/SaveButton';

export const NetworkInfoSettings = ({route, navigation}) => {
  const theme = useTheme();
  const [data, setData] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    NetInfo.refresh().then(setData({}));
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  }, []);

  const fetchData = useCallback(async () => {
    let netData = await NetInfo.fetch();
    // Some day we should try flattening this. I tried
    // https://stackoverflow.com/questions/33036487/one-liner-to-flatten-nested-object,
    // but I kept encountering an endless loop of useEffects.
    setData(netData.details);
  }, []);

  useEffect(() => {
    navigation.setOptions({title: route.params.title});
  }, [navigation, route.params.title]);

  useEffect(() => {
    fetchData().catch(e => console.error);
  }, [fetchData, data]);

  return (
    <SafeAreaView>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={{backgroundColor: theme.colors.background}}>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Key</DataTable.Title>
              <DataTable.Title>Value</DataTable.Title>
            </DataTable.Header>
            {Object.keys(data).map(key => (
              <DataTable.Row key={key}>
                <DataTable.Cell>{key}</DataTable.Cell>
                <DataTable.Cell>{data[key].toString()}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
          {/*<SaveButton buttonText={'Refresh'} onPress={() => onRefresh()} />*/}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
