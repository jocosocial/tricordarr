import React, {useEffect, useState, useCallback} from 'react';
import {RefreshControl, View} from 'react-native';
import {Text, DataTable, Divider} from 'react-native-paper';
import {
  getSharedWebSocket,
  startForegroundServiceWorker,
  stopForegroundServiceWorker,
} from '../../../libraries/Service';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton';
import {AppView} from '../../Views/AppView';
import {useUserNotificationData} from '../../Context/Contexts/UserNotificationDataContext';
import {commonStyles} from '../../../styles';
import {useBackHandler} from '@react-native-community/hooks';
import {fgsFailedCounter} from '../../../libraries/Service';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {NavigatorIDs, SettingsStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {useAppTheme} from '../../../styles/Theme';
import {SettingsStackParamList} from '../../Navigation/Stacks/SettingsStack';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {WebSocketState} from '../../../libraries/Network/Websockets';
import {SettingDataTableRow} from '../../DataTables/SettingDataTableRow';
import {SocketHealthcheckData} from '../../../libraries/Structs/SocketStructs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StorageKeys} from '../../../libraries/Storage';
import {RelativeTimeTag} from '../../Text/RelativeTimeTag';
import {SettingSwitch} from '../../Switches/SettingSwitch';

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
  const {appConfig, updateAppConfig} = useConfig();
  const [healthData, setHealthData] = useState<SocketHealthcheckData | undefined>();
  const [rawTime, setRawTime] = useState(false);
  const toggleRawTime = () => setRawTime(!rawTime);

  const fetchSocketState = useCallback(async () => {
    const ws = await getSharedWebSocket();
    if (ws) {
      setSocketState(ws.readyState);
    }
    AsyncStorage.getItem(StorageKeys.WS_HEALTHCHECK_DATA).then(item => {
      if (item) {
        const wsData = JSON.parse(item) as SocketHealthcheckData;
        setHealthData(wsData);
      }
    });
  }, []);

  // @TODO consider adding a listener to respond to socket onOpen events.
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSocketState().finally(() => setRefreshing(false));
  }, [fetchSocketState]);

  useEffect(() => {
    fetchSocketState().catch(console.error);
  }, [fetchSocketState]);

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
        <PaddedContentView padTop={true}>
          <Text variant={'titleMedium'}>Shared Websocket</Text>
          <DataTable>
            <SettingDataTableRow
              title={'Socket State'}
              value={WebSocketState[socketState as keyof typeof WebSocketState]}
            />
            <SettingDataTableRow onPress={() => toggleRawTime()} title={'Last Check'}>
              <RelativeTimeTag date={healthData?.timestamp} raw={rawTime} />
            </SettingDataTableRow>
            <SettingDataTableRow title={'Failed Count'} value={String(fgsFailedCounter)} />
          </DataTable>
        </PaddedContentView>
        <Divider bold={true} />
        <PaddedContentView padTop={true}>
          <Text variant={'titleMedium'}>Notifications</Text>
          <DataTable>
            <SettingDataTableRow title={'Enabled'} value={String(enableUserNotifications)} />
          </DataTable>
        </PaddedContentView>
        <Divider bold={true} />
        <PaddedContentView padTop={true}>
          <Text variant={'titleMedium'}>FGS Control</Text>
          <PrimaryActionButton
            buttonText={'Start'}
            buttonColor={theme.colors.twitarrPositiveButton}
            onPress={() => startForegroundServiceWorker().then(() => onRefresh())}
            style={[commonStyles.marginTopSmall]}
          />
          <PrimaryActionButton
            buttonText={'Stop'}
            buttonColor={theme.colors.twitarrNegativeButton}
            onPress={() => stopForegroundServiceWorker().then(() => onRefresh())}
            style={[commonStyles.marginTopSmall]}
          />
        </PaddedContentView>
        <Divider bold={true} />
        <PaddedContentView padTop={true}>
          <Text variant={'titleMedium'}>Override WiFi Check</Text>
          <View>
            <Text>
              Attempt server connection even if you're not on configured WiFi network. Requires app restart. May consume
              more battery.
            </Text>
            <SettingSwitch title={'Enable'} value={appConfig.overrideWifiCheck} onPress={toggleOverride} />
          </View>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
