import React, {useEffect, useState, useCallback} from 'react';
import {RefreshControl, ScrollView, View} from 'react-native';
import {DataTable, useTheme} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppView} from '../../Views/AppView';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {NavigatorIDs, SettingsStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {KvObject} from '../../../libraries/Types';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';
import {SettingsStackParamList} from '../../Navigation/Stacks/SettingsStack';

type Props = NativeStackScreenProps<
  SettingsStackParamList,
  SettingsStackScreenComponents.storageKeySettings,
  NavigatorIDs.settingsStack
>;

export const StorageKeysSettings = ({route, navigation}: Props) => {
  const theme = useTheme();
  const [data, setData] = useState<KvObject>({});
  const [refreshing, setRefreshing] = useState(false);
  const {setErrorMessage} = useErrorHandler();

  const fetchData = useCallback(async () => {
    const storageKeys = await AsyncStorage.getAllKeys();
    const storageData: KvObject = {};
    for (const key of storageKeys) {
      storageData[key] = await AsyncStorage.getItem(key);
    }
    setData(storageData);
  }, []);

  const onRefresh = useCallback(() => {
    console.log('onRefresh GO');
    setRefreshing(true);
    fetchData().catch(console.error);
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  }, [fetchData]);

  // useEffect(() => {
  //   if (route.params && route.params.hasOwnProperty('title')) {
  //     navigation.setOptions({title: route.params?.title});
  //   }
  // }, [navigation, route]);

  useEffect(() => {
    fetchData().catch(e => setErrorMessage(e));
  }, [fetchData, data, setErrorMessage]);

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
