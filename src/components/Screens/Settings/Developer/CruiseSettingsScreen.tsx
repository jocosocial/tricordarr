import React, {useState} from 'react';
import {RefreshControl} from 'react-native';
import {AppView} from '../../../Views/AppView';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView';
import {CruiseSettingsForm} from '../../../Forms/Settings/CruiseSettingsForm.tsx';
import {useConfig} from '../../../Context/Contexts/ConfigContext';
import {CruiseSettingsFormValues} from '../../../../libraries/Types/FormValues';
import {FormikHelpers} from 'formik';
import {PrimaryActionButton} from '../../../Buttons/PrimaryActionButton.tsx';
import {useClientConfigMutation} from '../../../Queries/Client/ClientMutations.ts';
import {useAppTheme} from '../../../../styles/Theme.ts';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView.tsx';

export const CruiseSettingsScreen = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const clientConfigMutation = useClientConfigMutation();
  const theme = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);

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

  const reloadClientConfig = () => {
    setRefreshing(true);
    clientConfigMutation.mutate(undefined, {
      onSettled: () => {
        setRefreshing(false);
      },
    });
  };

  return (
    <AppView>
      <ScrollingContentView refreshControl={<RefreshControl refreshing={refreshing} enabled={false} />}>
        <PaddedContentView>
          <CruiseSettingsForm onSubmit={onSubmit} initialValues={initialValues} />
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton
            buttonText={'Reload From Server'}
            onPress={reloadClientConfig}
            buttonColor={theme.colors.twitarrNeutralButton}
          />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
