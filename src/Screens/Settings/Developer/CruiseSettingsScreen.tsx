import {FormikHelpers} from 'formik';
import React, {useState} from 'react';
import {RefreshControl} from 'react-native';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {CruiseSettingsForm} from '#src/Components/Forms/Settings/CruiseSettingsForm';
import {PreRegistrationSettingsForm} from '#src/Components/Forms/Settings/PreRegistrationSettingsForm';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useClientSettings} from '#src/Context/Contexts/ClientSettingsContext';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {CruiseSettingsFormValues, PreRegistrationSettingsFormValues} from '#src/Types/FormValues';

export const CruiseSettingsScreen = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const {theme} = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);
  const {updateClientSettings} = useClientSettings();

  const initialValues: CruiseSettingsFormValues = {
    portTimeZoneID: appConfig.portTimeZoneID,
    cruiseLength: appConfig.cruiseLength.toString(),
    startDate: appConfig.cruiseStartDate,
    schedBaseUrl: appConfig.schedBaseUrl,
  };

  const preRegistrationInitialValues: PreRegistrationSettingsFormValues = {
    preRegistrationServerUrl: appConfig.preRegistrationServerUrl,
  };

  const onSubmit = (values: CruiseSettingsFormValues, helpers: FormikHelpers<CruiseSettingsFormValues>) => {
    let startDate = values.startDate;
    startDate.setHours(0);
    startDate.setMinutes(0);
    startDate.setSeconds(0);
    startDate.setMilliseconds(0);
    updateAppConfig({
      ...appConfig,
      portTimeZoneID: values.portTimeZoneID,
      cruiseLength: Number(values.cruiseLength),
      cruiseStartDate: startDate,
      schedBaseUrl: values.schedBaseUrl,
    });
    helpers.setSubmitting(false);
    helpers.resetForm({
      values: {
        portTimeZoneID: values.portTimeZoneID,
        cruiseLength: values.cruiseLength,
        startDate: values.startDate,
        schedBaseUrl: values.schedBaseUrl,
      },
    });
  };

  const onPreRegistrationSubmit = (
    values: PreRegistrationSettingsFormValues,
    helpers: FormikHelpers<PreRegistrationSettingsFormValues>,
  ) => {
    updateAppConfig({
      ...appConfig,
      preRegistrationServerUrl: values.preRegistrationServerUrl,
    });
    helpers.setSubmitting(false);
    helpers.resetForm({
      values: {
        preRegistrationServerUrl: values.preRegistrationServerUrl,
      },
    });
  };

  const reloadClientConfig = async () => {
    setRefreshing(true);
    await updateClientSettings();
    setRefreshing(false);
  };

  const togglePreRegistrationMode = () => {
    console.log('[CruiseSettingsScreen.tsx] toggling pre-registration mode to', !appConfig.preRegistrationMode);
    updateAppConfig({
      ...appConfig,
      preRegistrationMode: !appConfig.preRegistrationMode,
    });
  };

  return (
    <AppView>
      <ScrollingContentView isStack={true} refreshControl={<RefreshControl refreshing={refreshing} enabled={false} />}>
        <ListSubheader>General</ListSubheader>
        <PaddedContentView padTop={true} padBottom={false}>
          <PrimaryActionButton
            buttonText={'Reload From Server'}
            onPress={reloadClientConfig}
            buttonColor={theme.colors.twitarrNeutralButton}
          />
        </PaddedContentView>
        <PaddedContentView>
          <CruiseSettingsForm
            onSubmit={onSubmit}
            initialValues={initialValues}
            disabled={!appConfig.enableDeveloperOptions}
          />
        </PaddedContentView>
        {appConfig.enableDeveloperOptions && (
          <>
            <ListSubheader>Pre-Registration</ListSubheader>
            <PaddedContentView padTop={true}>
              <PrimaryActionButton
                buttonText={appConfig.preRegistrationMode ? 'Disable' : 'Enable'}
                onPress={togglePreRegistrationMode}
                buttonColor={theme.colors.twitarrNeutralButton}
              />
            </PaddedContentView>
            <PaddedContentView>
              <PreRegistrationSettingsForm
                onSubmit={onPreRegistrationSubmit}
                initialValues={preRegistrationInitialValues}
              />
            </PaddedContentView>
          </>
        )}
      </ScrollingContentView>
    </AppView>
  );
};
