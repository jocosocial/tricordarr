import {View} from 'react-native';
import {TextField} from '../Fields/TextField.tsx';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton.tsx';
import {Formik, FormikHelpers} from 'formik';
import React from 'react';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {CruiseSettingsFormValues} from '../../../libraries/Types/FormValues.ts';
import * as Yup from 'yup';
import {DateValidation, NumberValidation} from '../../../libraries/ValidationSchema.ts';
import {DatePickerField} from '../Fields/DatePickerField.tsx';
import {DirtyDetectionField} from '../Fields/DirtyDetectionField.tsx';

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
    <Formik
      initialValues={props.initialValues}
      onSubmit={props.onSubmit}
      validationSchema={validationSchema}
      enableReinitialize={true}>
      {({handleSubmit, isSubmitting, isValid, dirty}) => (
        <View>
          <DirtyDetectionField />
          <View style={[commonStyles.paddingVertical]}>
            <DatePickerField name={'startDate'} limitRange={false} />
          </View>
          <TextField name={'cruiseLength'} label={'Cruise Length (in days)'} keyboardType={'number-pad'} />
          <TextField name={'portTimeZoneID'} label={'Port Time Zone ID'} />
          <TextField name={'schedBaseUrl'} label={'Sched Base Url'} />
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
