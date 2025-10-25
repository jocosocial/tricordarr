import {Formik, type FormikHelpers, type FormikProps} from 'formik';
import {View} from 'react-native';
import * as Yup from 'yup';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {TextField} from '#src/Components/Forms/Fields/TextField';
import {SSIDValidation} from '#src/Libraries/ValidationSchema';
import {BackgroundConnectionSettingsFormValues} from '#src/Types/FormValues';

const validationSchema = Yup.object().shape({
  onboardWifiNetworkName: SSIDValidation,
});

interface BackgroundConnectionSettingsFormProps {
  initialValues: BackgroundConnectionSettingsFormValues;
  onSubmit: (
    values: BackgroundConnectionSettingsFormValues,
    helpers: FormikHelpers<BackgroundConnectionSettingsFormValues>,
  ) => void;
  formikRef?: React.Ref<FormikProps<BackgroundConnectionSettingsFormValues>>;
}

export const BackgroundConnectionSettingsForm = ({
  initialValues,
  onSubmit,
  formikRef,
}: BackgroundConnectionSettingsFormProps) => {
  return (
    <Formik innerRef={formikRef} initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
      {({handleSubmit, isSubmitting, isValid, dirty}) => (
        <View>
          <TextField
            name={'onboardWifiNetworkName'}
            label={'Onboard Wifi Network Name'}
            infoText={'The name of the wifi network that the app should be connected to to start the worker.'}
            keyboardType={'default'}
            autoCapitalize={'none'}
          />
          <PrimaryActionButton
            disabled={!isValid || isSubmitting || !dirty}
            isLoading={isSubmitting}
            onPress={handleSubmit}
            buttonText={'Save'}
          />
        </View>
      )}
    </Formik>
  );
};
