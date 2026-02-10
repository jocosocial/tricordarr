import {Formik, FormikHelpers, FormikProps} from 'formik';
import {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {BooleanField} from '#src/Components/Forms/Fields/BooleanField';
import {SliderField} from '#src/Components/Forms/Fields/SliderField';
import {BackgroundConnectionSettingsForm} from '#src/Components/Forms/Settings/BackgroundConnectionSettingsForm';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {createLogger} from '#src/Libraries/Logger';
import {buildWebsocketURL} from '#src/Libraries/Network/Websockets';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';
import {commonStyles} from '#src/Styles';
import {BackgroundConnectionSettingsFormValues} from '#src/Types/FormValues';

import NativeTricordarrModule from '#specs/NativeTricordarrModule';

const logger = createLogger('BackgroundConnectionSettingsIOSView.tsx');

interface ManagerStatus {
  isActive?: boolean;
  isEnabled?: boolean;
  matchSSIDs: string[];
  providerConfiguration?: string; // JSON string from native side
}

interface ForegroundProviderStatus {
  lastPing?: string;
  isActive?: boolean;
  socketPingInterval?: number;
}

export const BackgroundConnectionSettingsIOSView = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const {preRegistrationMode} = usePreRegistration();
  const [enable, setEnable] = useState(appConfig.enableBackgroundWorker);
  const [fgsHealthTime, setFgsHealthTime] = useState(appConfig.fgsWorkerHealthTimer / 1000);
  const {data, refetch} = useUserNotificationDataQuery();
  const {theme} = useAppTheme();
  const {setSnackbarPayload} = useSnackbar();
  const formikRef = useRef<FormikProps<BackgroundConnectionSettingsFormValues>>(null);
  const {currentSession} = useSession();
  const tokenData = currentSession?.tokenData || null;
  const [managerStatus, setManagerStatus] = useState<ManagerStatus | null>(null);
  const [foregroundProviderStatus, setForegroundProviderStatus] = useState<ForegroundProviderStatus | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetch(), fetchManagerStatus(), fetchForegroundProviderStatus()]);
    setRefreshing(false);
  }, [refetch]);

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
      // Restart the worker
    }
  };

  const resetDefaultValues = () => {
    if (data && data.shipWifiSSID) {
      updateAppConfig({
        ...appConfig,
        wifiNetworkNames: [data.shipWifiSSID],
      });
      formikRef.current?.resetForm({
        values: {
          wifiNetworkNames: [data.shipWifiSSID],
        },
      });
    } else {
      setSnackbarPayload({
        message: 'No SSID found in server payload.',
        messageType: 'error',
      });
    }
  };

  const handleSubmit = (
    values: BackgroundConnectionSettingsFormValues,
    helpers: FormikHelpers<BackgroundConnectionSettingsFormValues>,
  ) => {
    updateAppConfig({
      ...appConfig,
      wifiNetworkNames: values.wifiNetworkNames,
    });
    helpers.setSubmitting(false);
    helpers.resetForm({
      values: {
        wifiNetworkNames: values.wifiNetworkNames,
      },
    });
  };

  const handleSetupManager = async () => {
    if (!tokenData) {
      return;
    }
    try {
      const socketUrl = await buildWebsocketURL();
      logger.debug('setupLocalPushManager', socketUrl, tokenData.token, enable);
      NativeTricordarrModule.setupLocalPushManager(socketUrl, tokenData.token, enable);
      // Refresh status after recycling worker
      fetchManagerStatus();
      fetchForegroundProviderStatus();
    } catch (error) {
      logger.error('Error getting socket URL:', error);
    }
  };

  const formatProviderConfigValue = (value: any): string => {
    if (value === null || value === undefined) {
      return 'null';
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (typeof value === 'number') {
      return String(value);
    }
    if (typeof value === 'string') {
      return value;
    }
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : '[]';
    }
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return String(value);
      }
    }
    return String(value);
  };

  const fetchManagerStatus = async () => {
    try {
      const status = await NativeTricordarrModule.getBackgroundPushManagerStatus();
      setManagerStatus(status);
    } catch (error) {
      logger.error('Failed to fetch manager status:', error);
    }
  };

  const fetchForegroundProviderStatus = async () => {
    try {
      const status = await NativeTricordarrModule.getForegroundPushProviderStatus();
      setForegroundProviderStatus(status);
    } catch (error) {
      logger.error('Failed to fetch foreground provider status:', error);
    }
  };

  const parseProviderConfiguration = (configJson?: string): Record<string, any> | null => {
    if (!configJson) {
      return null;
    }
    try {
      return JSON.parse(configJson);
    } catch (error) {
      logger.error('Failed to parse provider configuration JSON:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchManagerStatus();
    fetchForegroundProviderStatus();
  }, []);

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <ListSection>
          <ListSubheader>About</ListSubheader>
        </ListSection>
        <PaddedContentView padTop={true}>
          <Text style={commonStyles.marginBottomSmall}>
            The background worker extension is necessary to enable push notifications in an off-grid environment.
          </Text>
          <Text>
            Apple Law™ allows the worker to start only when joined to certain WiFi networks. You can manage that list
            of networks below.
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
                disabled={preRegistrationMode}
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
                disabled={preRegistrationMode}
              />
            </View>
          </Formik>
        </PaddedContentView>
        <PaddedContentView>
          <BackgroundConnectionSettingsForm
            formikRef={formikRef}
            initialValues={{wifiNetworkNames: appConfig.wifiNetworkNames || []}}
            onSubmit={handleSubmit}
            disabled={preRegistrationMode}
          />
          <PrimaryActionButton
            disabled={
              (appConfig.wifiNetworkNames?.length === 1 && appConfig.wifiNetworkNames[0] === data?.shipWifiSSID) ||
              preRegistrationMode
            }
            onPress={resetDefaultValues}
            buttonText={'Reset to Default Networks'}
            style={commonStyles.marginTopSmall}
            buttonColor={theme.colors.twitarrNegativeButton}
          />
        </PaddedContentView>
        <ListSection>
          <ListSubheader>Status</ListSubheader>
        </ListSection>
        <DataFieldListItem title={'Default Networks'} description={appConfig.wifiNetworkNames?.join(', ')} />
        {managerStatus && (
          <>
            <DataFieldListItem
              title={'Manager Active'}
              description={managerStatus.isActive !== undefined ? (managerStatus.isActive ? 'Yes' : 'No') : 'Unknown'}
            />
            <DataFieldListItem
              title={'Manager Enabled'}
              description={managerStatus.isEnabled !== undefined ? (managerStatus.isEnabled ? 'Yes' : 'No') : 'Unknown'}
            />
            <DataFieldListItem
              title={'Match SSIDs'}
              description={managerStatus.matchSSIDs.length > 0 ? managerStatus.matchSSIDs.join(', ') : 'None'}
            />
          </>
        )}
        <ListSection>
          <ListSubheader>Provider Configuration</ListSubheader>
        </ListSection>
        {(() => {
          const providerConfig = parseProviderConfiguration(managerStatus?.providerConfiguration);
          return providerConfig ? (
            Object.entries(providerConfig).map(([key, value]) => (
              <DataFieldListItem
                key={key}
                title={key}
                description={formatProviderConfigValue(value)}
                sensitive={key.toLowerCase().includes('token')}
              />
            ))
          ) : (
            <DataFieldListItem title={'Provider Configuration'} description={'Not available'} />
          );
        })()}
        <ListSection>
          <ListSubheader>In-App Socket Status</ListSubheader>
        </ListSection>
        {foregroundProviderStatus && (
          <>
            <DataFieldListItem
              title={'Last Ping'}
              description={
                foregroundProviderStatus.lastPing
                  ? // <RelativeTimeTag date={new Date(foregroundProviderStatus.lastPing)} />
                    foregroundProviderStatus.lastPing.toString()
                  : 'Never'
              }
              // description={
              //   foregroundProviderStatus.lastPing ? new Date(foregroundProviderStatus.lastPing).toString() : 'Never'
              // }
            />
            <DataFieldListItem
              title={'Provider Active'}
              description={
                foregroundProviderStatus.isActive != null
                  ? foregroundProviderStatus.isActive
                    ? 'Yes'
                    : 'No'
                  : 'Unknown'
              }
            />
            <DataFieldListItem
              title={'Ping Interval'}
              description={
                foregroundProviderStatus.socketPingInterval != null
                  ? `${foregroundProviderStatus.socketPingInterval} seconds`
                  : 'Unknown'
              }
            />
          </>
        )}
        <ListSection>
          <ListSubheader>Control</ListSubheader>
        </ListSection>
        <PaddedContentView padTop={true}>
          <PrimaryActionButton
            buttonText={'Recycle Worker'}
            onPress={handleSetupManager}
            disabled={!tokenData || preRegistrationMode}
            buttonColor={theme.colors.twitarrNeutralButton}
          />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
