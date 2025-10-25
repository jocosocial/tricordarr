import {Formik, FormikHelpers, FormikProps} from 'formik';
import {useRef, useState} from 'react';
import {View} from 'react-native';
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
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';
import {commonStyles} from '#src/Styles';
import {useAppTheme} from '#src/Styles/Theme';
import {BackgroundConnectionSettingsFormValues} from '#src/Types/FormValues';

export const BackgroundConnectionSettingsIOSView = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const [enable, setEnable] = useState(appConfig.enableBackgroundWorker);
  const [fgsHealthTime, setFgsHealthTime] = useState(appConfig.fgsWorkerHealthTimer / 1000);
  const {data} = useUserNotificationDataQuery();
  const theme = useAppTheme();
  const {setSnackbarPayload} = useSnackbar();
  const formikRef = useRef<FormikProps<BackgroundConnectionSettingsFormValues>>(null);

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

  const reloadSSIDFromServer = () => {
    if (data && data.shipWifiSSID) {
      updateAppConfig({
        ...appConfig,
        onboardWifiNetworkName: data.shipWifiSSID,
      });
      formikRef.current?.resetForm({
        values: {
          onboardWifiNetworkName: data.shipWifiSSID,
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
      onboardWifiNetworkName: values.onboardWifiNetworkName,
    });
    helpers.setSubmitting(false);
    helpers.resetForm({
      values: {
        onboardWifiNetworkName: values.onboardWifiNetworkName,
      },
    });
  };

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <ListSection>
          <ListSubheader>About</ListSubheader>
        </ListSection>
        <PaddedContentView padTop={true}>
          <Text>In progress...</Text>
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
        <PaddedContentView>
          <BackgroundConnectionSettingsForm
            formikRef={formikRef}
            initialValues={{onboardWifiNetworkName: appConfig.onboardWifiNetworkName}}
            onSubmit={handleSubmit}
          />
          <PrimaryActionButton
            onPress={reloadSSIDFromServer}
            buttonText={'Reset name from server'}
            style={commonStyles.marginTopSmall}
            buttonColor={theme.colors.twitarrNeutralButton}
            disabled={data?.shipWifiSSID === appConfig.onboardWifiNetworkName}
          />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
