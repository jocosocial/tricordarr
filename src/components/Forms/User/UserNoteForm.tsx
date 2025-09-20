import React from 'react';
import {View} from 'react-native';
import {Formik, FormikHelpers} from 'formik';
import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {UserNoteFormValues} from '#src/Types/FormValues';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import * as Yup from 'yup';
import {TextField} from '#src/Components/Forms/Fields/TextField';
import {DirtyDetectionField} from '#src/Components/Forms/Fields/DirtyDetectionField';

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
