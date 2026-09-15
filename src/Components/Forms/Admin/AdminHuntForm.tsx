import {Formik, FormikHelpers} from 'formik';
import React from 'react';
import {View} from 'react-native';
import * as Yup from 'yup';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {DirtyDetectionField} from '#src/Components/Forms/Fields/DirtyDetectionField';
import {TextField} from '#src/Components/Forms/Fields/TextField';
import {AdminHuntFormValues} from '#src/Types/FormValues';

interface AdminHuntFormProps {
  initialValues: AdminHuntFormValues;
  onSubmit: (values: AdminHuntFormValues, helpers: FormikHelpers<AdminHuntFormValues>) => void;
  buttonText: string;
  showPuzzlesField: boolean;
}

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  description: Yup.string().required('Description is required'),
});

export const AdminHuntForm = ({initialValues, onSubmit, buttonText, showPuzzlesField}: AdminHuntFormProps) => {
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={validationSchema}
      enableReinitialize={true}>
      {({handleSubmit, isSubmitting, isValid}) => (
        <View>
          <DirtyDetectionField />
          <TextField name={'title'} testID={'huntTitle-field'} label={'Title'} />
          <TextField
            name={'description'}
            testID={'huntDescription-field'}
            label={'Description'}
            multiline={true}
            numberOfLines={4}
          />
          {showPuzzlesField && (
            <TextField
              name={'puzzlesJson'}
              testID={'huntPuzzles-field'}
              label={'Puzzles JSON'}
              multiline={true}
              numberOfLines={8}
              infoText={
                'JSON array of puzzles. Each object needs title, body, and answer. Optional unlockTime (ISO8601) and hints (object of strings). Puzzles cannot be added after the hunt is created.'
              }
            />
          )}
          <PrimaryActionButton
            testID={'huntSave-button'}
            buttonText={buttonText}
            onPress={handleSubmit}
            disabled={!isValid || isSubmitting}
            isLoading={isSubmitting}
          />
        </View>
      )}
    </Formik>
  );
};
