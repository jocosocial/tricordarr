import {FormikHelpers} from 'formik';
import React, {useState} from 'react';
import {Alert} from 'react-native';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {CruiseSettingsForm} from '#src/Components/Forms/Settings/CruiseSettingsForm';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useClientSettings} from '#src/Context/Contexts/ClientSettingsContext';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {createLogger} from '#src/Libraries/Logger';
import {CruiseSettingsFormValues} from '#src/Types/FormValues';

const logger = createLogger('CruiseSettingsScreen.tsx');

export const CruiseSettingsScreen = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const {currentSession, updateSession} = useSession();
  const {theme} = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);
  const {updateClientSettings} = useClientSettings();

  const initialValues: CruiseSettingsFormValues = {
    portTimeZoneID: appConfig.portTimeZoneID,
    cruiseLength: appConfig.cruiseLength.toString(),
    startDate: appConfig.cruiseStartDate,
    schedBaseUrl: appConfig.schedBaseUrl,
  };

  const onSubmit = (values: CruiseSettingsFormValues, helpers: FormikHelpers<CruiseSettingsFormValues>) => {
    let startDate = values.startDate;
    startDate.setHours(0);
    startDate.setMinutes(0);
    startDate.setSeconds(0);
    startDate.setMilliseconds(0);
    const y = startDate.getFullYear();
    const m = String(startDate.getMonth() + 1).padStart(2, '0');
    const d = String(startDate.getDate()).padStart(2, '0');
    updateAppConfig({
      ...appConfig,
      portTimeZoneID: values.portTimeZoneID,
      cruiseLength: Number(values.cruiseLength),
      cruiseStartDateStr: `${y}-${m}-${d}`,
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

  const reloadClientConfig = async () => {
    setRefreshing(true);
    await updateClientSettings();
    setRefreshing(false);
  };

  const togglePreRegistrationMode = async () => {
    if (!currentSession) {
      logger.error('Cannot toggle pre-registration mode: no current session');
      return;
    }
    if (currentSession.preRegistrationMode) {
      Alert.alert(
        'Disable Pre-Registration',
        'Disabling pre-registration mode may cause unexpected behavior and voids your nonexistent warranty. Continue?',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Disable',
            onPress: async () => {
              logger.debug('toggling pre-registration mode to', false);
              await updateSession(currentSession.sessionID, {preRegistrationMode: false});
            },
          },
        ],
      );
      return;
    }
    logger.debug('toggling pre-registration mode to', true);
    await updateSession(currentSession.sessionID, {preRegistrationMode: true});
  };

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} enabled={false} />}>
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
        <ListSubheader>Pre-Registration</ListSubheader>
        <PaddedContentView padTop={true}>
          <PrimaryActionButton
            buttonText={currentSession?.preRegistrationMode ? 'Disable' : 'Enable'}
            onPress={togglePreRegistrationMode}
            buttonColor={theme.colors.twitarrNeutralButton}
          />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
