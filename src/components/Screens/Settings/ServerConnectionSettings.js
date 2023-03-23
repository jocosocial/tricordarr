import React, {useEffect, useState, useCallback} from 'react';
import {RefreshControl, Switch, View} from 'react-native';
import {useTheme, Text, DataTable, TouchableRipple} from 'react-native-paper';
import {startForegroundServiceWorker, stopForegroundServiceWorker} from '../../../libraries/Service';
import {SaveButton} from '../../Buttons/SaveButton';
import {getSharedWebSocket} from '../../../libraries/Network/Websockets';
import {AppView} from '../../Views/AppView';
import {useUserNotificationData} from '../../Context/Contexts/UserNotificationDataContext';
import {commonStyles} from '../../../styles';
import {AppSettings} from '../../../libraries/AppSettings';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';
import {useBackHandler} from '@react-native-community/hooks';
import {fgsFailedCounter} from '../../../libraries/Service';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';

// https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/readyState
const WebSocketState = Object.freeze({
  0: 'Connecting',
  1: 'Open',
  2: 'Closing',
  3: 'Closed',
  // I made this one up.
  69: 'Uninitialized',
});

export const ServerConnectionSettings = ({navigation}) => {
  const theme = useTheme();
  const [socketState, setSocketState] = useState(69);
  const [refreshing, setRefreshing] = useState(false);
  const {enableUserNotifications} = useUserNotificationData();
  const [override, setOverride] = useState(false);
  const {setErrorMessage} = useErrorHandler();
  const [wsHealthcheckDate, setWsHealthcheckDate] = useState('unknown');
  const [wsOpenDate, setWsOpenDate] = useState('unknown');

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
  }, [fetchSocketState]);

  useEffect(() => {
    fetchSocketState().catch(console.error);
  }, [fetchSocketState]);

  useEffect(() => {
    async function getSettingValue() {
      // https://stackoverflow.com/questions/263965/how-can-i-convert-a-string-to-boolean-in-javascript
      setOverride((await AppSettings.OVERRIDE_WIFI_CHECK.getValue()) === 'true');
      setWsHealthcheckDate(await AppSettings.WS_HEALTHCHECK_DATE.getValue());
      setWsOpenDate(await AppSettings.WS_OPEN_DATE.getValue());
    }

    getSettingValue().catch(e => setErrorMessage(e.toString()));
  }, [setErrorMessage, refreshing]);

  // @TODO there has to be a better way to deal with background-loaded view not having a stack screen to go back to.
  useBackHandler(() => {
    navigation.replace('SettingsScreen');
    return true;
  });

  async function toggleOverride() {
    await AppSettings.OVERRIDE_WIFI_CHECK.setValue(String(!override));
    setOverride(!override);
  }

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <PaddedContentView>
          <View>
            <Text>
              A connection to the server is made in the background and persists when the app is not running or
              immediately visible. To achieve this, Android Law(tm) requires you to be notified that the process is
              running. Android 13 allows you to dismiss the notification while keeping the background process running.
            </Text>
          </View>
          <View style={commonStyles.marginTop}>
            <Text variant={'titleLarge'}>Websocket</Text>
            <DataTable>
              <DataTable.Row key={'wsState'}>
                <DataTable.Cell>{'Socket State'}</DataTable.Cell>
                <DataTable.Cell>{WebSocketState[socketState]}</DataTable.Cell>
              </DataTable.Row>
              <DataTable.Row key={'wsHealthcheckDate'}>
                <DataTable.Cell>Last Healthcheck</DataTable.Cell>
                <DataTable.Cell>{wsHealthcheckDate}</DataTable.Cell>
              </DataTable.Row>
              <DataTable.Row key={'wsOpenDate'}>
                <DataTable.Cell>Opened</DataTable.Cell>
                <DataTable.Cell>{wsOpenDate}</DataTable.Cell>
              </DataTable.Row>
              <DataTable.Row key={'wsFailCount'}>
                <DataTable.Cell>Failed Health Count</DataTable.Cell>
                <DataTable.Cell>{fgsFailedCounter}</DataTable.Cell>
              </DataTable.Row>
            </DataTable>
          </View>
          <View style={commonStyles.marginTop}>
            <Text variant={'titleLarge'}>Notifications</Text>
            <DataTable>
              <DataTable.Row key={'notifications'}>
                <DataTable.Cell>{'Enabled'}</DataTable.Cell>
                <DataTable.Cell>{String(enableUserNotifications)}</DataTable.Cell>
              </DataTable.Row>
            </DataTable>
          </View>
          <View style={commonStyles.marginTop}>
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
          <View style={commonStyles.marginTop}>
            <Text variant={'titleLarge'}>Override WiFi Check</Text>
            <View>
              <Text>{AppSettings.OVERRIDE_WIFI_CHECK.description}</Text>
              <TouchableRipple style={commonStyles.marginTop} onPress={toggleOverride}>
                <View style={commonStyles.booleanSettingRowView}>
                  <Text>Enable</Text>
                  <Switch value={override} onValueChange={toggleOverride} />
                </View>
              </TouchableRipple>
            </View>
          </View>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
