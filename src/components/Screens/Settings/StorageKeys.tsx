import React, {useEffect, useState, useCallback} from 'react';
import {RefreshControl, ScrollView, View} from 'react-native';
import {DataTable, useTheme} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppView} from '../../Views/AppView';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ParamListBase} from '@react-navigation/native';
import {NavigatorIDs, SettingsStackScreenIDs} from '../../../libraries/Enums/Navigation';

type Props = NativeStackScreenProps<
  ParamListBase,
  SettingsStackScreenIDs.storageKeySettings,
  NavigatorIDs.settingsStack
>;

export const StorageKeysSettings = ({route, navigation}: Props) => {
  const theme = useTheme();
  const [data, setData] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    const storageKeys = await AsyncStorage.getAllKeys();
    const storageData = {};
    for (const key of storageKeys) {
      storageData[key] = await AsyncStorage.getItem(key);
    }
    setData(storageData);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData().catch(console.error);
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  }, []);

  useEffect(() => {
    navigation.setOptions({title: route.params.title});
  }, [navigation, route.params.title]);

  useEffect(() => {
    fetchData().catch(e => console.error);
  }, [fetchData, data]);

  return (
    <AppView>
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
                <DataTable.Cell>{data[key]}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </View>
      </ScrollView>
    </AppView>
  );
};
