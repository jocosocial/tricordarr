import React, {useEffect, useState, useCallback} from 'react';
import {RefreshControl, SafeAreaView, ScrollView, View} from 'react-native';
import {useTheme, Text, DataTable} from 'react-native-paper';
import {startForegroundServiceWorker, stopForegroundServiceWorker} from '../../../libraries/Service';
import {SaveButton} from '../../Buttons/SaveButton';
import {getSharedWebSocket} from '../../../libraries/Websockets';
import NetInfo from '@react-native-community/netinfo';
import {AppView} from '../../Views/AppView';
import {useUserNotificationData} from '../../Contexts/UserNotificationDataContext';

// https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/readyState
const WebSocketState = Object.freeze({
  0: 'Connecting',
  1: 'Open',
  2: 'Closing',
  3: 'Closed',
  // I made this one up.
  69: 'Uninitialized',
});

export const ServerConnectionSettings = ({route, navigation}) => {
  const theme = useTheme();
  const [socketState, setSocketState] = useState(69);
  const [refreshing, setRefreshing] = useState(false);
  const {enableUserNotifications} = useUserNotificationData();

  const fetchSocketState = useCallback(async () => {
    const ws = await getSharedWebSocket();
    if (ws) {
      setSocketState(ws.readyState);
    }
  }, []);

  // @TODO consider adding a listener to respond to socket onOpen events.
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSocketState().finally(() => setRefreshing(false));
    // NetInfo.refresh().then(() => setData({})).finally(() => setRefreshing(false));
    // setTimeout(() => {
    //   setRefreshing(false);
    // }, 500);
  }, [fetchSocketState]);

  useEffect(() => {
    navigation.setOptions({title: route.params.title});
  }, [navigation, route.params.title]);

  useEffect(() => {
    fetchSocketState().catch(console.error);
  }, [fetchSocketState]);

  return (
    <AppView>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={{backgroundColor: theme.colors.background, padding: 20}}>
          <View>
            <Text variant={'titleLarge'}>Websocket</Text>
            <DataTable>
              <DataTable.Row key={'wsState'}>
                <DataTable.Cell>{'Socket State'}</DataTable.Cell>
                <DataTable.Cell>{WebSocketState[socketState]}</DataTable.Cell>
              </DataTable.Row>
            </DataTable>
          </View>
          <View>
            <Text variant={'titleLarge'}>Notifications</Text>
            <DataTable>
              <DataTable.Row key={'notifications'}>
                <DataTable.Cell>{'Enabled'}</DataTable.Cell>
                <DataTable.Cell>{enableUserNotifications.toString()}</DataTable.Cell>
              </DataTable.Row>
            </DataTable>
          </View>
          <View>
            <Text variant={'titleLarge'}>FGS Control</Text>
            <SaveButton
              buttonText={'Start'}
              buttonColor={theme.colors.twitarrPositiveButton}
              onPress={() => startForegroundServiceWorker().catch(console.error)}
            />
            <SaveButton
              buttonText={'Stop'}
              buttonColor={theme.colors.twitarrNegativeButton}
              onPress={() => stopForegroundServiceWorker().catch(console.error)}
            />
          </View>
        </View>
      </ScrollView>
    </AppView>
  );
};
