import {View} from 'react-native';
import {TextField} from './Fields/TextField';
import {PrimaryActionButton} from '../Buttons/PrimaryActionButton';
import {Formik, FormikHelpers} from 'formik';
import React from 'react';
import {useStyles} from '../Context/Contexts/StyleContext';
import {CruiseSettingsFormValues} from '../../libraries/Types/FormValues';
import * as Yup from 'yup';
import {DateValidation, NumberValidation} from '../../libraries/ValidationSchema';
import {DatePickerField} from './Fields/DatePickerField';

interface CruiseSettingsFormProps {
  initialValues: CruiseSettingsFormValues;
  onSubmit: (values: CruiseSettingsFormValues, helpers: FormikHelpers<CruiseSettingsFormValues>) => void;
}

const validationSchema = Yup.object().shape({
  portTimeZoneID: Yup.string().required(),
  startDate: DateValidation,
  cruiseLength: NumberValidation,
});

export const CruiseSettingsForm = (props: CruiseSettingsFormProps) => {
  const {commonStyles} = useStyles();
  return (
    <Formik initialValues={props.initialValues} onSubmit={props.onSubmit} validationSchema={validationSchema}>
      {({handleSubmit, isSubmitting, isValid}) => (
        <View>
          <DatePickerField name={'startDate'} limitRange={false} />
          <TextField name={'cruiseLength'} label={'Cruise Length (in days)'} />
          <TextField name={'portTimeZoneID'} label={'Port Time Zone ID'} />
          <PrimaryActionButton
            disabled={!isValid || isSubmitting}
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
