import React from 'react';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {TimeSettingsForm} from '#src/Components/Forms/Settings/TimeSettingsForm';
import {TimeSettingsFormValues} from '#src/Types/FormValues';
import {FormikHelpers} from 'formik';

export const TimeSettingsScreen = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const onSubmit = (values: TimeSettingsFormValues, helpers: FormikHelpers<TimeSettingsFormValues>) => {
    updateAppConfig({
      ...appConfig,
      manualTimeOffset: Number(values.manualTimeOffset),
    });
    helpers.setSubmitting(false);
  };
  const initialValues: TimeSettingsFormValues = {manualTimeOffset: appConfig.manualTimeOffset.toString()};
  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <PaddedContentView>
          <TimeSettingsForm onSubmit={onSubmit} initialValues={initialValues} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
