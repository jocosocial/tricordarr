import {FormikHelpers} from 'formik';
import React from 'react';

import {NotificationPollingSettingsForm} from '#src/Components/Forms/Settings/NotificationPollingSettingsForm';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {NotificationPollingSettingsFormValues} from '#src/Types/FormValues';

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
      <ScrollingContentView isStack={true}>
        <PaddedContentView>
          <NotificationPollingSettingsForm onSubmit={handleSubmit} initialValues={initialValues} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
