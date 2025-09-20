import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView.tsx';
import React from 'react';
import {AppView} from '../../../Views/AppView.tsx';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView.tsx';
import {FormikHelpers} from 'formik';
import {useConfig} from '../../../Context/Contexts/ConfigContext.ts';
import {NotificationPollingSettingsForm} from '../../../Forms/Settings/NotificationPollingSettingsForm.tsx';
import {NotificationPollingSettingsFormValues} from '../../../../Libraries/Types/FormValues.ts';

export const NotificationPollerSettingsScreen = () => {
  const {appConfig, updateAppConfig} = useConfig();

  const handleSubmit = (
    values: NotificationPollingSettingsFormValues,
    helpers: FormikHelpers<NotificationPollingSettingsFormValues>,
  ) => {
    updateAppConfig({
      ...appConfig,
      enableNotificationPolling: values.enableNotificationPolling,
      notificationPollInterval: values.notificationPollIntervalMinutes * 60 * 1000,
    });
    helpers.setSubmitting(false);
    helpers.resetForm({
      values: {
        enableNotificationPolling: values.enableNotificationPolling,
        notificationPollIntervalMinutes: values.notificationPollIntervalMinutes,
      },
    });
  };

  const initialValues: NotificationPollingSettingsFormValues = {
    notificationPollIntervalMinutes: appConfig.notificationPollInterval / 1000 / 60,
    enableNotificationPolling: appConfig.enableNotificationPolling,
  };

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <NotificationPollingSettingsForm onSubmit={handleSubmit} initialValues={initialValues} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
