import React from 'react';
import {View} from 'react-native';
import {Formik, FormikHelpers} from 'formik';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton.tsx';
import {UserNoteFormValues} from '../../../Libraries/Types/FormValues.ts';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import * as Yup from 'yup';
import {TextField} from '../Fields/TextField.tsx';
import {DirtyDetectionField} from '../Fields/DirtyDetectionField.tsx';

interface UserNoteFormProps {
  onSubmit: (values: UserNoteFormValues, helpers: FormikHelpers<UserNoteFormValues>) => void;
  initialValues: UserNoteFormValues;
}

const validationSchema = Yup.object().shape({});

// https://formik.org/docs/guides/react-native
export const UserNoteForm = ({onSubmit, initialValues}: UserNoteFormProps) => {
  const {commonStyles} = useStyles();
  const styles = {
    inputContainer: [],
    buttonContainer: [commonStyles.marginTopSmall],
  };
  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
      {({handleSubmit, isSubmitting, values}) => (
        <View>
          <DirtyDetectionField />
          <TextField
            viewStyle={styles.inputContainer}
            name={'note'}
            label={'Note'}
            autoCapitalize={'sentences'}
            multiline={true}
            numberOfLines={3}
          />
          <PrimaryActionButton
            disabled={!values.note || isSubmitting}
            isLoading={isSubmitting}
            viewStyle={styles.buttonContainer}
            onPress={handleSubmit}
            buttonText={'Save'}
          />
        </View>
      )}
    </Formik>
  );
};
