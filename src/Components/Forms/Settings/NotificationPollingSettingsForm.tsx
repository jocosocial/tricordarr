import {Formik, FormikHelpers} from 'formik';
import React from 'react';
import {View} from 'react-native';
import * as Yup from 'yup';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {BooleanField} from '#src/Components/Forms/Fields/BooleanField';
import {SliderField} from '#src/Components/Forms/Fields/SliderField';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {NotificationPollingSettingsFormValues} from '#src/Types/FormValues';

interface NotificationPollingSettingsFormProps {
  initialValues: NotificationPollingSettingsFormValues;
  onSubmit: (
    values: NotificationPollingSettingsFormValues,
    helpers: FormikHelpers<NotificationPollingSettingsFormValues>,
  ) => void;
}

const validationSchema = Yup.object().shape({
  notificationPollIntervalMinutes: Yup.number().required().min(1).max(10),
});

export const NotificationPollingSettingsForm = (props: NotificationPollingSettingsFormProps) => {
  const {commonStyles} = useStyles();
  return (
    <Formik initialValues={props.initialValues} onSubmit={props.onSubmit} validationSchema={validationSchema}>
      {({values, handleSubmit, isSubmitting, isValid, dirty}) => (
        <View>
          <BooleanField
            name={'enableNotificationPolling'}
            label={'Enable Notification Polling'}
            helperText={
              'Enable periodic notification data polling. This functionality is redundant with the WebSockets and Background Worker, but exists in the event those perform poorly.'
            }
            value={values.enableNotificationPolling}
          />
          <SliderField
            value={values.notificationPollIntervalMinutes}
            maximumValue={10}
            minimumValue={1}
            step={1}
            unit={'minute'}
            label={'Poll Interval'}
            name={'notificationPollIntervalMinutes'}
            helperText={'Minutes between automatic refreshing of notification information from the server.'}
          />
          <PrimaryActionButton
            disabled={!isValid || isSubmitting || !dirty}
            isLoading={isSubmitting}
            viewStyle={commonStyles.marginTopSmall}
            onPress={handleSubmit}
            buttonText={'Save'}
          />
        </View>
      )}
    </Formik>
  );
};
