import React from 'react';
import {AppView} from '../../../Views/AppView.tsx';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView.tsx';
import {useConfig} from '../../../Context/Contexts/ConfigContext.ts';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView.tsx';
import {TimeSettingsForm} from '../../../Forms/Settings/TimeSettingsForm.tsx';
import {TimeSettingsFormValues} from '../../../../libraries/Types/FormValues.ts';
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
