import {Formik, FormikHelpers, FormikProps} from 'formik';
import {useRef, useState} from 'react';
import {RefreshControl, View} from 'react-native';
import {Text} from 'react-native-paper';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {BooleanField} from '#src/Components/Forms/Fields/BooleanField';
import {SliderField} from '#src/Components/Forms/Fields/SliderField';
import {BackgroundConnectionSettingsForm} from '#src/Components/Forms/Settings/BackgroundConnectionSettingsForm';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useAuth} from '#src/Context/Contexts/AuthContext';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {buildWebsocketURL} from '#src/Libraries/Network/Websockets';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';
import {commonStyles} from '#src/Styles';
import {useAppTheme} from '#src/Styles/Theme';
import {BackgroundConnectionSettingsFormValues} from '#src/Types/FormValues';

import NativeTricordarrModule from '#specs/NativeTricordarrModule';

export const BackgroundConnectionSettingsIOSView = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const [enable, setEnable] = useState(appConfig.enableBackgroundWorker);
  const [fgsHealthTime, setFgsHealthTime] = useState(appConfig.fgsWorkerHealthTimer / 1000);
  const {data, refetch, isFetching} = useUserNotificationDataQuery();
  const theme = useAppTheme();
  const {setSnackbarPayload} = useSnackbar();
  const formikRef = useRef<FormikProps<BackgroundConnectionSettingsFormValues>>(null);
  const {tokenData} = useAuth();

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
    const socketUrl = await buildWebsocketURL();
    console.log('setupLocalPushManager', socketUrl, tokenData.token, enable);
    NativeTricordarrModule.setupLocalPushManager(socketUrl, tokenData.token, enable);
  };

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}>
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
        <PaddedContentView>
          <BackgroundConnectionSettingsForm
            formikRef={formikRef}
            initialValues={{wifiNetworkNames: appConfig.wifiNetworkNames || []}}
            onSubmit={handleSubmit}
          />
          <PrimaryActionButton
            disabled={
              isFetching ||
              (appConfig.wifiNetworkNames?.length === 1 && appConfig.wifiNetworkNames[0] === data?.shipWifiSSID)
            }
            onPress={resetDefaultValues}
            buttonText={'Reset'}
            style={commonStyles.marginTopSmall}
            buttonColor={theme.colors.twitarrNeutralButton}
          />
        </PaddedContentView>
        <ListSection>
          <ListSubheader>Control</ListSubheader>
        </ListSection>
        <PaddedContentView padTop={true}>
          <PrimaryActionButton
            buttonText={'Recycle Worker'}
            onPress={handleSetupManager}
            disabled={!tokenData}
            buttonColor={theme.colors.twitarrNeutralButton}
          />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
