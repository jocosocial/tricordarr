import React, {useEffect, useState, useCallback} from 'react';
import {RefreshControl, View} from 'react-native';
import {Text, DataTable, Divider, HelperText} from 'react-native-paper';
import {
  getSharedWebSocket,
  startForegroundServiceWorker,
  stopForegroundServiceWorker,
} from '../../../../libraries/Service';
import {PrimaryActionButton} from '../../../Buttons/PrimaryActionButton';
import {AppView} from '../../../Views/AppView';
import {useUserNotificationData} from '../../../Context/Contexts/UserNotificationDataContext';
import {commonStyles} from '../../../../styles';
import {useBackHandler} from '@react-native-community/hooks';
import {fgsFailedCounter} from '../../../../libraries/Service';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {NavigatorIDs, SettingsStackScreenComponents} from '../../../../libraries/Enums/Navigation';
import {useAppTheme} from '../../../../styles/Theme';
import {SettingsStackParamList} from '../../../Navigation/Stacks/SettingsStack';
import {useConfig} from '../../../Context/Contexts/ConfigContext';
import {WebSocketState} from '../../../../libraries/Network/Websockets';
import {SettingDataTableRow} from '../../../DataTables/SettingDataTableRow';
import {SocketHealthcheckData} from '../../../../libraries/Structs/SocketStructs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StorageKeys} from '../../../../libraries/Storage';
import {RelativeTimeTag} from '../../../Text/RelativeTimeTag';
import {SettingSwitch} from '../../../Switches/SettingSwitch';
import {Formik} from 'formik';
import {BooleanField} from '../../../Forms/Fields/BooleanField';

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
  const [enable, setEnable] = useState(appConfig.enableBackgroundWorker);

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

  const handleEnable = () => {
    const newValue = !appConfig.enableBackgroundWorker;
    updateAppConfig({
      ...appConfig,
      enableBackgroundWorker: newValue,
    });
    setEnable(newValue);
  };

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <Divider bold={true} />
        <PaddedContentView padSides={false}>
          <Formik initialValues={{}} onSubmit={() => {}}>
            <View>
              <BooleanField
                name={'enableBackgroundWorker'}
                label={'Enable Background Worker'}
                onPress={handleEnable}
                style={commonStyles.paddingHorizontal}
                helperText={
                  'The background worker (which Android calls a Foreground Service) is necessary to enable push notifications in an off-grid environment.'
                }
                value={enable}
              />
            </View>
          </Formik>
        </PaddedContentView>
        <Divider bold={true} />
        <PaddedContentView padTop={true}>
          <Text variant={'titleMedium'}>Worker WebSocket</Text>
          <HelperText type={'info'} style={{color: theme.colors.onBackground}}>
            You can pull to refresh this page if you believe the WebSocket state is out of date.
          </HelperText>
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
          <Text variant={'titleMedium'}>Worker Control</Text>
          <HelperText type={'info'} style={{color: theme.colors.onBackground}}>
            Note: It may take up to 10 seconds for the worker notification to appear on start.
          </HelperText>
          <DataTable>
            <SettingDataTableRow title={'Enabled'} value={String(enableUserNotifications)} />
          </DataTable>
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
      </ScrollingContentView>
    </AppView>
  );
};
