import {SafeAreaView, ScrollView, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Text, DataTable, useTheme} from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import {SaveButton} from '../../Buttons/SaveButton';

export const NetworkInfoSettings = ({route, navigation}) => {
  const theme = useTheme();
  const [data, setData] = useState({});

  useEffect(() => {
    navigation.setOptions({title: route.params.title});
  }, [navigation, route.params.title]);

  useEffect(() => {
    console.log('useEffect');
    async function fetchData() {
      let netData = await NetInfo.fetch();
      // Some day we should try flattening this. I tried
      // https://stackoverflow.com/questions/33036487/one-liner-to-flatten-nested-object,
      // but I kept encountering an endless loop of useEffects.
      setData(netData.details);
    }
    fetchData().catch(e => console.error);
  }, [data]);

  function refresh() {
    NetInfo.refresh();
    setData({});
  }

  return (
    <SafeAreaView>
      <ScrollView>
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
          <SaveButton buttonText={'Refresh'} onPress={() => refresh()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
