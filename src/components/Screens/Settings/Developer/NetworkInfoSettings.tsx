import React, {useState, useCallback} from 'react';
import {RefreshControl, ScrollView, View} from 'react-native';
import {DataTable, useTheme} from 'react-native-paper';
import NetInfo, {useNetInfo} from '@react-native-community/netinfo';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppView} from '../../../Views/AppView';
import {NavigatorIDs, SettingsStackScreenComponents} from '../../../../libraries/Enums/Navigation';
import {SettingsStackParamList} from '../../../Navigation/Stacks/SettingsStack';

type Props = NativeStackScreenProps<
  SettingsStackParamList,
  SettingsStackScreenComponents.networkInfoSettings,
  NavigatorIDs.settingsStack
>;

export const NetworkInfoSettings = ({route, navigation}: Props) => {
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const data = useNetInfo();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    NetInfo.refresh().finally(() => setRefreshing(false));
  }, []);

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
