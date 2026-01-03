import {Formik, FormikHelpers} from 'formik';
import React from 'react';
import {View} from 'react-native';
import * as Yup from 'yup';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {DirtyDetectionField} from '#src/Components/Forms/Fields/DirtyDetectionField';
import {TextField} from '#src/Components/Forms/Fields/TextField';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {SignedIntegerValidation} from '#src/Libraries/ValidationSchema';
import {TimeSettingsFormValues} from '#src/Types/FormValues';

interface TimeSettingsFormProps {
  initialValues: TimeSettingsFormValues;
  onSubmit: (values: TimeSettingsFormValues, helpers: FormikHelpers<TimeSettingsFormValues>) => void;
}

const validationSchema = Yup.object().shape({
  manualTimeOffset: SignedIntegerValidation,
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
