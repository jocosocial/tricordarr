import {View} from 'react-native';
import {TextField} from '#src/Components/Forms/Fields/TextField.tsx';
import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton.tsx';
import {Formik, FormikHelpers} from 'formik';
import React from 'react';
import {useStyles} from '#src/Components/Context/Contexts/StyleContext.ts';
import {PreRegistrationSettingsFormValues} from '#src/Libraries/Types/FormValues.ts';
import * as Yup from 'yup';
import {ServerURLValidation} from '#src/Libraries/ValidationSchema.ts';
import {DirtyDetectionField} from '#src/Components/Forms/Fields/DirtyDetectionField.tsx';
import {DatePickerField} from '#src/Components/Forms/Fields/DatePickerField.tsx';

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
