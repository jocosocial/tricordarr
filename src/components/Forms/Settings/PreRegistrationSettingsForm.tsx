import {Formik, FormikHelpers} from 'formik';
import React from 'react';
import {View} from 'react-native';
import * as Yup from 'yup';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {DatePickerField} from '#src/Components/Forms/Fields/DatePickerField';
import {DirtyDetectionField} from '#src/Components/Forms/Fields/DirtyDetectionField';
import {TextField} from '#src/Components/Forms/Fields/TextField';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {ServerURLValidation} from '#src/Libraries/ValidationSchema';
import {PreRegistrationSettingsFormValues} from '#src/Types/FormValues';

interface CruiseSettingsFormProps {
  initialValues: PreRegistrationSettingsFormValues;
  onSubmit: (
    values: PreRegistrationSettingsFormValues,
    helpers: FormikHelpers<PreRegistrationSettingsFormValues>,
  ) => void;
}

const validationSchema = Yup.object().shape({
  preRegistrationServerUrl: ServerURLValidation,
  preRegistrationEndDate: Yup.date(),
});

export const PreRegistrationSettingsForm = (props: CruiseSettingsFormProps) => {
  const {commonStyles} = useStyles();
  return (
    <Formik
      initialValues={props.initialValues}
      onSubmit={props.onSubmit}
      validationSchema={validationSchema}
      enableReinitialize={true}>
      {({handleSubmit, isSubmitting, isValid, dirty}) => (
        <View>
          <DirtyDetectionField />
          <TextField name={'preRegistrationServerUrl'} label={'URL'} autoCapitalize={'none'} />
          <DatePickerField name={'preRegistrationEndDate'} label={'End Date'} limitRange={false} />
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
