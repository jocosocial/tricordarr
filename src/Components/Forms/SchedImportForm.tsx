import {Formik, FormikHelpers} from 'formik';
import React from 'react';
import {View} from 'react-native';
import * as Yup from 'yup';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {TextField} from '#src/Components/Forms/Fields/TextField';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {SchedImportFormValues} from '#src/Types/FormValues';

interface SchedImportFormProps {
  initialValues: SchedImportFormValues;
  onSubmit: (values: SchedImportFormValues, helpers: FormikHelpers<SchedImportFormValues>) => void;
}

const validationSchema = Yup.object().shape({
  username: Yup.string().required().min(3),
});

export const SchedImportForm = (props: SchedImportFormProps) => {
  const {commonStyles} = useStyles();
  return (
    <Formik
      initialValues={props.initialValues}
      onSubmit={props.onSubmit}
      validationSchema={validationSchema}
      enableReinitialize={true}>
      {({handleSubmit, isSubmitting, isValid, dirty}) => (
        <View>
          <TextField name={'schedUrl'} label={'Sched URL'} autoCapitalize={'none'} keyboardType={'url'} />
          <TextField name={'username'} label={'Sched.com Username'} autoCapitalize={'none'} />
          <PrimaryActionButton
            disabled={!isValid || isSubmitting || !dirty}
            isLoading={isSubmitting}
            viewStyle={commonStyles.marginTopSmall}
            onPress={handleSubmit}
            buttonText={'Import'}
          />
        </View>
      )}
    </Formik>
  );
};
