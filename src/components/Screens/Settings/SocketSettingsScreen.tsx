import React, {useCallback, useEffect, useState} from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {SettingSwitch} from '../../Switches/SettingSwitch';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {DataTable, Divider, Text} from 'react-native-paper';
import {SocketControlView} from '../../Views/SocketControlView';
import {RelativeTimeTag} from '../../Text/RelativeTimeTag';
import {SocketHealthcheckData} from '../../../libraries/Structs/SocketStructs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StorageKeys} from '../../../libraries/Storage';
import {RefreshControl} from 'react-native';
import {commonStyles} from '../../../styles';
import {useSocket} from '../../Context/Contexts/SocketContext';

export const SocketSettingsScreen = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const [healthData, setHealthData] = useState<SocketHealthcheckData | undefined>();
  const [refreshing, setRefreshing] = useState(false);
  const [rawTime, setRawTime] = useState(false);
  const {openNotificationSocket, closeNotificationSocket} = useSocket();
  const toggleRawTime = () => setRawTime(!rawTime);

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
    AsyncStorage.getItem(StorageKeys.WS_HEALTHCHECK_DATA)
      .then(item => {
        if (item) {
          const wsData = JSON.parse(item) as SocketHealthcheckData;
          setHealthData(wsData);
        }
      })
      .finally(() => {
        setRefreshing(false);
      });
  }, []);

  useEffect(() => {
    onRefresh();
  }, [onRefresh]);

  return (
    <AppView>
      <ScrollingContentView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <PaddedContentView>
          <Text variant={'titleMedium'}>Notification Socket Status</Text>
          <DataTable>
            <DataTable.Row
              style={{
                ...commonStyles.paddingHorizontalZero,
                ...commonStyles.borderBottomZero,
              }}
              key={'wsHealthTime'}
              onPress={() => toggleRawTime()}>
              <DataTable.Cell>{'Last Check'}</DataTable.Cell>
              <DataTable.Cell style={commonStyles.flex2}>
                <RelativeTimeTag date={healthData?.timestamp} raw={rawTime} />
              </DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row
              style={{
                ...commonStyles.paddingHorizontalZero,
                ...commonStyles.borderBottomZero,
              }}
              key={'wsHealthStatus'}>
              <DataTable.Cell>{'Last Result'}</DataTable.Cell>
              <DataTable.Cell style={commonStyles.flex2}>{healthData?.result ? 'Pass' : 'Fail'}</DataTable.Cell>
            </DataTable.Row>
          </DataTable>
        </PaddedContentView>
        <Divider bold={true} />
        <PaddedContentView padTop={true}>
          <Text variant={'titleMedium'}>Enable</Text>
          <SettingSwitch
            title={'Notification Socket'}
            value={appConfig.enableNotificationSocket}
            onPress={toggleNotificationSocket}
            description={'Used for general purpose notifications across all app features.'}
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
            onOpen={openNotificationSocket}
            onClose={closeNotificationSocket}
          />
        </PaddedContentView>
        <Divider bold={true} />
      </ScrollingContentView>
    </AppView>
  );
};
