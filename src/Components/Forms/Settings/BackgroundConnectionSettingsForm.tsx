import {Formik, type FormikHelpers, type FormikProps} from 'formik';
import {View} from 'react-native';
import * as Yup from 'yup';

import {StringChipsField} from '#src/Components/Forms/Fields/StringChipsField';
import {SSIDValidation} from '#src/Libraries/ValidationSchema';
import {BackgroundConnectionSettingsFormValues} from '#src/Types/FormValues';

const validationSchema = Yup.object().shape({
  wifiNetworkNames: Yup.array().of(SSIDValidation).min(0),
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
      {({handleSubmit}) => (
        <View>
          <StringChipsField
            name={'wifiNetworkNames'}
            label={'Wifi Networks'}
            helperText={
              'Names of the WiFi networks that the app must be connected to in order to enable the background worker.'
            }
            onAddValue={handleSubmit}
            onRemoveValue={handleSubmit}
            inputLabel={'Add new network'}
          />
        </View>
      )}
    </Formik>
  );
};
