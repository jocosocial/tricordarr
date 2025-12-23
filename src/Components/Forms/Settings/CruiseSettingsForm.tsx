import {Formik, FormikHelpers} from 'formik';
import React from 'react';
import {View} from 'react-native';
import * as Yup from 'yup';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {DatePickerField} from '#src/Components/Forms/Fields/DatePickerField';
import {DirtyDetectionField} from '#src/Components/Forms/Fields/DirtyDetectionField';
import {TextField} from '#src/Components/Forms/Fields/TextField';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {DateValidation, NumberValidation} from '#src/Libraries/ValidationSchema';
import {CruiseSettingsFormValues} from '#src/Types/FormValues';

interface CruiseSettingsFormProps {
  initialValues: CruiseSettingsFormValues;
  onSubmit: (values: CruiseSettingsFormValues, helpers: FormikHelpers<CruiseSettingsFormValues>) => void;
  disabled?: boolean;
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
      disabled={props.disabled}
      enableReinitialize={true}>
      {({handleSubmit, isSubmitting, isValid, dirty}) => (
        <View>
          <DirtyDetectionField />
          <View style={[commonStyles.paddingVertical]}>
            <DatePickerField name={'startDate'} limitRange={false} disabled={props.disabled} />
          </View>
          <TextField
            name={'cruiseLength'}
            label={'Cruise Length (in days)'}
            keyboardType={'number-pad'}
            disabled={props.disabled}
          />
          <TextField name={'portTimeZoneID'} label={'Port Time Zone ID'} disabled={props.disabled} />
          <TextField name={'schedBaseUrl'} label={'Sched Base Url'} disabled={props.disabled} />
          {!props.disabled && (
            <PrimaryActionButton
              disabled={!isValid || isSubmitting || !dirty || props.disabled}
              isLoading={isSubmitting}
              viewStyle={commonStyles.marginTopSmall}
              onPress={handleSubmit}
              buttonText={'Save'}
            />
          )}
        </View>
      )}
    </Formik>
  );
};
