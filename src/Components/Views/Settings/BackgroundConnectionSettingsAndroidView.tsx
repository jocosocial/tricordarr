import AsyncStorage from '@react-native-async-storage/async-storage';
import {Formik} from 'formik';
import React, {useCallback, useEffect, useState} from 'react';
import {RefreshControl, View} from 'react-native';
import {HelperText, Text} from 'react-native-paper';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {BooleanField} from '#src/Components/Forms/Fields/BooleanField';
import {SliderField} from '#src/Components/Forms/Fields/SliderField';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {RelativeTimeTag} from '#src/Components/Text/Tags/RelativeTimeTag';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {BatteryOptimizationSettingsView} from '#src/Components/Views/Settings/BatteryOptimizationSettingsView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useEnableUserNotification} from '#src/Context/Contexts/EnableUserNotificationContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {WebSocketState} from '#src/Libraries/Network/Websockets';
import {startPushProvider, stopPushProvider} from '#src/Libraries/Notifications/Push';
import {fgsFailedCounter, getSharedWebSocket} from '#src/Libraries/Notifications/Push/Android/ForegroundService';
import {StorageKeys} from '#src/Libraries/Storage';
import {SocketHealthcheckData} from '#src/Structs/SocketStructs';
import {commonStyles} from '#src/Styles';

export const BackgroundConnectionSettingsAndroidView = () => {
  const {theme} = useAppTheme();
  const [socketState, setSocketState] = useState(69);
  const [refreshing, setRefreshing] = useState(false);
  const {enableUserNotifications} = useEnableUserNotification();
  const {appConfig, updateAppConfig} = useConfig();
  const [healthData, setHealthData] = useState<SocketHealthcheckData | undefined>();
  const [enable, setEnable] = useState(appConfig.enableBackgroundWorker);
  const [fgsHealthTime, setFgsHealthTime] = useState(appConfig.fgsWorkerHealthTimer / 1000);
  const [fgsStartDate, setFgsStartDate] = useState<Date | undefined>();

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

  const fetchStart = async () => {
    AsyncStorage.getItem(StorageKeys.FGS_START).then(item => {
      if (item) {
        const date = new Date(JSON.parse(item));
        setFgsStartDate(date);
      }
    });
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSocketState()
      .then(() => fetchStart())
      .finally(() => setRefreshing(false));
  }, [fetchSocketState]);

  useEffect(() => {
    fetchSocketState()
      .then(() => fetchStart())
      .catch(console.error);
  }, [fetchSocketState]);

  // useBackHandler(() => {
  //   navigation.replace(SettingsStackScreenComponents.settings);
  //   return true;
  // });

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
      stopPushProvider().then(() => startPushProvider());
    }
  };

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <ListSection>
          <ListSubheader>About</ListSubheader>
        </ListSection>
        <PaddedContentView padTop={true}>
          <Text style={commonStyles.marginBottomSmall}>
            The background worker (which Android calls a Foreground Service) is necessary to enable push notifications
            in an off-grid environment.
          </Text>
          <Text>
            Android Law™ currently requires the app to display a notification that this worker has started. You can
            safely dismiss the notification and the worker will continue to run.
          </Text>
        </PaddedContentView>
        <ListSection>
          <ListSubheader>Settings</ListSubheader>
        </ListSection>
        <PaddedContentView padSides={false} padBottom={false}>
          <Formik initialValues={{}} onSubmit={() => {}}>
            <View>
              <BooleanField
                name={'enableBackgroundWorker'}
                label={'Enable Background Worker'}
                onPress={handleEnable}
                style={commonStyles.paddingHorizontalSmall}
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
                style={commonStyles.paddingHorizontalSmall}
                onSlidingComplete={handleHealthChange}
              />
            </View>
          </Formik>
        </PaddedContentView>
        <ListSection>
          <ListSubheader>Status</ListSubheader>
          <DataFieldListItem title={'Previous Start'} description={<RelativeTimeTag date={fgsStartDate} />} />
          <DataFieldListItem
            title={'Socket State'}
            description={WebSocketState[socketState as keyof typeof WebSocketState]}
          />
          <DataFieldListItem
            title={'Last Check'}
            description={healthData ? <RelativeTimeTag date={new Date(healthData.timestamp)} /> : <Text>Unknown</Text>}
          />
          <DataFieldListItem title={'Failed Count'} description={String(fgsFailedCounter)} />
        </ListSection>
        <PaddedContentView padBottom={false} />
        <PaddedContentView padSides={false}>
          <HelperText type={'info'} style={{color: theme.colors.onBackground}}>
            You can pull to refresh this page if you believe the WebSocket state is out of date.
          </HelperText>
        </PaddedContentView>
        <ListSection>
          <ListSubheader>Control</ListSubheader>
        </ListSection>
        <DataFieldListItem title={'Enabled'} description={String(enableUserNotifications)} />
        <PaddedContentView>
          <PrimaryActionButton
            buttonText={'Start'}
            buttonColor={theme.colors.twitarrPositiveButton}
            onPress={() => startPushProvider().then(() => onRefresh())}
            style={[commonStyles.marginTopSmall]}
          />
          <PrimaryActionButton
            buttonText={'Stop'}
            buttonColor={theme.colors.twitarrNegativeButton}
            onPress={() => stopPushProvider().then(() => onRefresh())}
            style={[commonStyles.marginTopSmall]}
          />
        </PaddedContentView>
        <PaddedContentView padSides={false}>
          <HelperText type={'info'} style={{color: theme.colors.onBackground}}>
            Note: It may take up to 10 seconds for the worker notification to appear on start.
          </HelperText>
        </PaddedContentView>
        <BatteryOptimizationSettingsView />
      </ScrollingContentView>
    </AppView>
  );
};
