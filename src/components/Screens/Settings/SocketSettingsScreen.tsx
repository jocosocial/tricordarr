import React, {useCallback, useEffect, useState} from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {SettingSwitch} from '../../Switches/SettingSwitch';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {DataTable, Divider, Text} from 'react-native-paper';
import {SocketControlView} from '../../Views/SocketControlView';
import {RefreshControl} from 'react-native';
import {useSocket} from '../../Context/Contexts/SocketContext';
import {WebSocketState} from '../../../libraries/Network/Websockets';
import {SettingDataTableRow} from '../../DataTables/SettingDataTableRow';

export const SocketSettingsScreen = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const [refreshing, setRefreshing] = useState(false);
  const {closeNotificationSocket, notificationSocket} = useSocket();
  const [notificationSocketState, setNotificationSocketState] = useState(
    WebSocketState[notificationSocket?.readyState as keyof typeof WebSocketState],
  );

  async function toggleNotificationSocket() {
    updateAppConfig({
      ...appConfig,
      enableNotificationSocket: !appConfig.enableNotificationSocket,
    });
  }

  async function toggleFezSocket() {
    updateAppConfig({
      ...appConfig,
      enableFezSocket: !appConfig.enableFezSocket,
    });
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setNotificationSocketState(WebSocketState[notificationSocket?.readyState as keyof typeof WebSocketState]);
    setRefreshing(false);
  }, [notificationSocket, setNotificationSocketState, setRefreshing]);

  useEffect(() => {
    onRefresh();
  }, [onRefresh]);

  return (
    <AppView>
      <ScrollingContentView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <PaddedContentView>
          <Text variant={'titleMedium'}>Notification Socket Status</Text>
          <DataTable>
            <SettingDataTableRow title={'Socket State'} value={notificationSocketState} />
          </DataTable>
        </PaddedContentView>
        <Divider bold={true} />
        <PaddedContentView padTop={true}>
          <Text variant={'titleMedium'}>Enable</Text>
          <SettingSwitch
            title={'Notification Socket'}
            value={appConfig.enableNotificationSocket}
            onPress={toggleNotificationSocket}
            description={
              'Used for general purpose notifications across all app features. Not used for background connection.'
            }
          />
          <SettingSwitch
            title={'Fez Sockets'}
            value={appConfig.enableFezSocket}
            onPress={toggleFezSocket}
            description={
              'Opened when a fez is loaded. Provides membership change messages in addition to content updates.'
            }
          />
        </PaddedContentView>
        <Divider bold={true} />
        <PaddedContentView padTop={true}>
          <Text variant={'titleMedium'}>Control</Text>
          <SocketControlView
            title={'Notification Socket'}
            disabled={!appConfig.enableNotificationSocket}
            onReset={closeNotificationSocket}
          />
          <Text variant={'bodyMedium'}>
            This triggers a socket close and open. The socket can be disabled or more persistently closed by disabling
            it above.
          </Text>
          <Text variant={'bodyMedium'}>You may need to refresh this screen for current state.</Text>
        </PaddedContentView>
        <Divider bold={true} />
      </ScrollingContentView>
    </AppView>
  );
};
