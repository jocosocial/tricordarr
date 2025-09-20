import {CruiseSettingsFormValues, TimeSettingsFormValues} from '#src/Libraries/Types/FormValues.ts';
import {Formik, FormikHelpers} from 'formik';
import * as Yup from 'yup';
import {useStyles} from '#src/Components/Context/Contexts/StyleContext.ts';
import {View} from 'react-native';
import {DirtyDetectionField} from '#src/Components/Forms/Fields/DirtyDetectionField.tsx';
import {TextField} from '#src/Components/Forms/Fields/TextField.tsx';
import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton.tsx';
import React from 'react';
import {NumberValidation} from '#src/Libraries/ValidationSchema.ts';

interface TimeSettingsFormProps {
  initialValues: TimeSettingsFormValues;
  onSubmit: (values: TimeSettingsFormValues, helpers: FormikHelpers<TimeSettingsFormValues>) => void;
}

const validationSchema = Yup.object().shape({
  manualTimeOffset: NumberValidation,
});

export const TimeSettingsForm = (props: TimeSettingsFormProps) => {
  const {commonStyles} = useStyles();
  console.log(props.initialValues);

  return (
    <Formik
      initialValues={props.initialValues}
      onSubmit={props.onSubmit}
      validationSchema={validationSchema}
      enableReinitialize={true}>
      {({handleSubmit, isSubmitting, isValid, dirty}) => (
        <View>
          <DirtyDetectionField />
          <TextField
            name={'manualTimeOffset'}
            label={'Manual Time Zone Offset'}
            keyboardType={'number-pad'}
            infoText={
              "Manually specify the time zone offset from the port time zone. You should only adjust this if you were instructed to do so by THO or the TwitarrTeam. Or you really know what you're doing."
            }
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
