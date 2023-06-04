import React, {useEffect, useState, useCallback} from 'react';
import {RefreshControl, Switch, View} from 'react-native';
import {Text, DataTable, TouchableRipple} from 'react-native-paper';
import {startForegroundServiceWorker, stopForegroundServiceWorker} from '../../../libraries/Service';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton';
import {getSharedWebSocket} from '../../../libraries/Network/Websockets';
import {AppView} from '../../Views/AppView';
import {useUserNotificationData} from '../../Context/Contexts/UserNotificationDataContext';
import {commonStyles} from '../../../styles';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';
import {useBackHandler} from '@react-native-community/hooks';
import {fgsFailedCounter} from '../../../libraries/Service';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {NavigatorIDs, SettingsStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {useAppTheme} from '../../../styles/Theme';
import {SettingsStackParamList} from '../../Navigation/Stacks/SettingsStack';
import {useConfig} from '../../Context/Contexts/ConfigContext';

// https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/readyState
// @TODO this has been moved to the library
// duplicated by Websockets.ts
const WebSocketState = Object.freeze({
  0: 'Connecting',
  1: 'Open',
  2: 'Closing',
  3: 'Closed',
  // I made this one up.
  69: 'Uninitialized',
});

type Props = NativeStackScreenProps<
  SettingsStackParamList,
  SettingsStackScreenComponents.serverConnectionSettings,
  NavigatorIDs.settingsStack
>;

export const ServerConnectionSettings = ({navigation}: Props) => {
  const theme = useAppTheme();
  const [socketState, setSocketState] = useState(69);
  const [refreshing, setRefreshing] = useState(false);
  const {enableUserNotifications} = useUserNotificationData();
  const {setErrorMessage} = useErrorHandler();
  const [wsHealthcheckDate, setWsHealthcheckDate] = useState('unknown');
  const [wsOpenDate, setWsOpenDate] = useState('unknown');
  const {appConfig, updateAppConfig} = useConfig();

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
      setWsHealthcheckDate('UNKNOWN');
      setWsOpenDate('UNKNOWN');
    }

    getSettingValue().catch(e => setErrorMessage(e.toString()));
  }, [setErrorMessage, refreshing]);

  useBackHandler(() => {
    navigation.replace(SettingsStackScreenComponents.settings);
    return true;
  });

  async function toggleOverride() {
    updateAppConfig({
      ...appConfig,
      overrideWifiCheck: !appConfig.overrideWifiCheck,
    });
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
            <PrimaryActionButton
              buttonText={'Start'}
              buttonColor={theme.colors.twitarrPositiveButton}
              onPress={() => startForegroundServiceWorker().catch(console.error)}
              style={[commonStyles.marginTopSmall]}
            />
            <PrimaryActionButton
              buttonText={'Stop'}
              buttonColor={theme.colors.twitarrNegativeButton}
              onPress={() => stopForegroundServiceWorker().catch(console.error)}
              style={[commonStyles.marginTopSmall]}
            />
          </View>
          <View style={commonStyles.marginTop}>
            <Text variant={'titleLarge'}>Override WiFi Check</Text>
            <View>
              <Text>
                Attempt server connection even if you're not on configured WiFi network. Requires app restart. May
                consume more battery.
              </Text>
              <TouchableRipple style={commonStyles.marginTop} onPress={toggleOverride}>
                <View style={commonStyles.booleanSettingRowView}>
                  <Text>Enable</Text>
                  <Switch value={appConfig.overrideWifiCheck} onValueChange={toggleOverride} />
                </View>
              </TouchableRipple>
            </View>
          </View>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
