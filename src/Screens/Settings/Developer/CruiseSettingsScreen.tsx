import {Formik, FormikHelpers} from 'formik';
import React, {useState} from 'react';
import {View} from 'react-native';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {BooleanField} from '#src/Components/Forms/Fields/BooleanField';
import {CruiseSettingsForm} from '#src/Components/Forms/Settings/CruiseSettingsForm';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useClientSettings} from '#src/Context/Contexts/ClientSettingsContext';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {alertDisablePreRegistration} from '#src/Libraries/Alerts/SettingsAlerts';
import {createLogger} from '#src/Libraries/Logger';
import {CruiseSettingsFormValues} from '#src/Types/FormValues';

const logger = createLogger('CruiseSettingsScreen.tsx');

export const CruiseSettingsScreen = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const {currentSession, updateSession} = useSession();
  const {theme} = useAppTheme();
  const {commonStyles} = useStyles();
  const [refreshing, setRefreshing] = useState(false);
  const {updateClientSettings} = useClientSettings();
  const [dismissMinAccessWarning, setDismissMinAccessWarning] = useState(appConfig.dismissMinAccessWarning);

  const initialValues: CruiseSettingsFormValues = {
    portTimeZoneID: appConfig.portTimeZoneID,
    cruiseLength: appConfig.cruiseLength.toString(),
    startDate: appConfig.cruiseStartDate,
    schedBaseUrl: appConfig.schedBaseUrl,
    shipCode: appConfig.shipCode,
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
      shipCode: values.shipCode,
    });
    helpers.setSubmitting(false);
    helpers.resetForm({
      values: {
        portTimeZoneID: values.portTimeZoneID,
        cruiseLength: values.cruiseLength,
        startDate: values.startDate,
        schedBaseUrl: values.schedBaseUrl,
        shipCode: values.shipCode,
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
      alertDisablePreRegistration(async () => {
        logger.debug('toggling pre-registration mode to', false);
        await updateSession(currentSession.sessionID, {preRegistrationMode: false});
      });
      return;
    }
    logger.debug('toggling pre-registration mode to', true);
    await updateSession(currentSession.sessionID, {preRegistrationMode: true});
  };

  const handleDismissMinAccessWarning = () => {
    const newValue = !dismissMinAccessWarning;
    updateAppConfig({...appConfig, dismissMinAccessWarning: newValue});
    setDismissMinAccessWarning(newValue);
  };

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} enabled={false} />}>
        <ListSubheader>Voyage</ListSubheader>
        <PaddedContentView padTop={true} padBottom={false}>
          <PrimaryActionButton
            testID={'reloadFromServer-button'}
            buttonText={'Reload From Server'}
            onPress={reloadClientConfig}
            buttonColor={theme.colors.twitarrNeutralButton}
          />
        </PaddedContentView>
        <PaddedContentView>
          <CruiseSettingsForm onSubmit={onSubmit} initialValues={initialValues} />
        </PaddedContentView>
        <ListSubheader>Pre-Registration</ListSubheader>
        <PaddedContentView padTop={true}>
          <PrimaryActionButton
            testID={'cruisePreRegistration-button'}
            buttonText={currentSession?.preRegistrationMode ? 'Disable' : 'Enable'}
            onPress={togglePreRegistrationMode}
            buttonColor={theme.colors.twitarrNeutralButton}
          />
        </PaddedContentView>
        <ListSubheader>Client</ListSubheader>
        <Formik initialValues={{}} onSubmit={() => {}}>
          <View>
            <BooleanField
              name={'dismissMinAccessWarning'}
              testID={'dismissMinAccessWarning-switch'}
              label={'Hide Maintenance Mode Warning'}
              onPress={handleDismissMinAccessWarning}
              value={dismissMinAccessWarning}
              helperText={'Hide the banner shown when the server has a minimum access level restriction.'}
              style={commonStyles.paddingHorizontalSmall}
            />
          </View>
        </Formik>
      </ScrollingContentView>
    </AppView>
  );
};
