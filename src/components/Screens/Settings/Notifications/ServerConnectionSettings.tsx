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
import {RelativeTimeTag} from '../../../Text/Tags/RelativeTimeTag';
import {Formik} from 'formik';
import {BooleanField} from '../../../Forms/Fields/BooleanField';
import {SliderField} from '../../../Forms/Fields/SliderField';
import {BatteryOptimizationSettingsView} from '../../../Views/Settings/BatteryOptimizationSettingsView';

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
  const [fgsHealthTime, setFgsHealthTime] = useState(appConfig.fgsWorkerHealthTimer / 1000);

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

  const handleHealthChange = (seconds: number) => {
    const newValue = 1000 * seconds;
    if (newValue !== appConfig.fgsWorkerHealthTimer) {
      updateAppConfig({
        ...appConfig,
        fgsWorkerHealthTimer: newValue,
      });
      setFgsHealthTime(seconds);
      stopForegroundServiceWorker().then(() => startForegroundServiceWorker());
    }
  }

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <PaddedContentView padTop={true}>
          <Text style={commonStyles.marginBottomSmall}>
            The background worker (which Android calls a Foreground Service) is necessary to enable push notifications
            in an off-grid environment.
          </Text>
          <Text>
            Android Law(tm) currently requires the app to display a notification that this worker has started. You can
            safely dismiss the notification and the worker will continue to run.
          </Text>
        </PaddedContentView>
        <Divider bold={true} />
        <PaddedContentView padSides={false}>
          <Formik initialValues={{}} onSubmit={() => {}}>
            <View>
              <BooleanField
                name={'enableBackgroundWorker'}
                label={'Enable Background Worker'}
                onPress={handleEnable}
                style={commonStyles.paddingHorizontal}
                helperText={'Use this to disable the worker if it is causing problems.'}
                value={enable}
              />
              <SliderField
                name={'fgsWorkerHealthTimer'}
                label={'Healthcheck Interval'}
                value={fgsHealthTime}
                minimumValue={10}
                maximumValue={60}
                step={10}
                unit={'second'}
                helperText={
                  "Interval at which the app checks that the socket is open. Don't change this unless instructed to."
                }
                style={commonStyles.paddingHorizontal}
                onSlidingComplete={handleHealthChange}
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
        <BatteryOptimizationSettingsView />
        <Divider bold={true} />
      </ScrollingContentView>
    </AppView>
  );
};
