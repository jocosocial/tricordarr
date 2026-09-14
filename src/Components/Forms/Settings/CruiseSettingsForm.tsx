import {Formik, FormikHelpers} from 'formik';
import React from 'react';
import {View} from 'react-native';
import * as Yup from 'yup';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {DatePickerField} from '#src/Components/Forms/Fields/DatePickerField';
import {DirtyDetectionField} from '#src/Components/Forms/Fields/DirtyDetectionField';
import {ShipCodePickerField} from '#src/Components/Forms/Fields/ShipCodePickerField';
import {TextField} from '#src/Components/Forms/Fields/TextField';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {DateValidation, IntegerValidation} from '#src/Libraries/ValidationSchema';
import {CruiseSettingsFormValues} from '#src/Types/FormValues';

interface CruiseSettingsFormProps {
  initialValues: CruiseSettingsFormValues;
  onSubmit: (values: CruiseSettingsFormValues, helpers: FormikHelpers<CruiseSettingsFormValues>) => void;
}

const validationSchema = Yup.object().shape({
  portTimeZoneID: Yup.string().required(),
  startDate: DateValidation,
  cruiseLength: IntegerValidation,
});

export const CruiseSettingsForm = (props: CruiseSettingsFormProps) => {
  const {commonStyles} = useStyles();
  return (
    <Formik
      initialValues={props.initialValues}
      onSubmit={props.onSubmit}
      validationSchema={validationSchema}
      enableReinitialize={true}>
      {({handleSubmit, isSubmitting, isValid, dirty, values}) => (
        <View>
          <DirtyDetectionField />
          <View style={commonStyles.paddingVertical}>
            <ShipCodePickerField
              name={'shipCode'}
              testID={'cruiseShipCode-button'}
              label={'Ship'}
              value={values.shipCode}
            />
          </View>
          <View style={commonStyles.paddingBottom}>
            <DatePickerField name={'startDate'} testID={'cruiseStartDate-button'} />
          </View>
          <TextField
            name={'cruiseLength'}
            testID={'cruiseLength-input'}
            label={'Cruise Length (in days)'}
            keyboardType={'number-pad'}
          />
          <TextField name={'portTimeZoneID'} testID={'cruisePortTimeZone-input'} label={'Port Time Zone ID'} />
          <TextField name={'schedBaseUrl'} testID={'cruiseSchedUrl-input'} label={'Sched Base Url'} />
          <PrimaryActionButton
            disabled={!isValid || isSubmitting || !dirty}
            isLoading={isSubmitting}
            onPress={handleSubmit}
            buttonText={'Save'}
            testID={'cruiseSettingsSave-button'}
          />
        </View>
      )}
    </Formik>
  );
};
