import {Formik, FormikHelpers} from 'formik';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import * as Yup from 'yup';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {BooleanField} from '#src/Components/Forms/Fields/BooleanField';
import {DatePickerField} from '#src/Components/Forms/Fields/DatePickerField';
import {DirtyDetectionField} from '#src/Components/Forms/Fields/DirtyDetectionField';
import {TextField} from '#src/Components/Forms/Fields/TextField';
import {TimePickerField} from '#src/Components/Forms/Fields/TimePickerField';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AdminHuntPuzzleFormValues} from '#src/Types/FormValues';

interface AdminPuzzleFormProps {
  initialValues: AdminHuntPuzzleFormValues;
  onSubmit: (values: AdminHuntPuzzleFormValues, helpers: FormikHelpers<AdminHuntPuzzleFormValues>) => void;
}

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  body: Yup.string().required('Body is required'),
  answer: Yup.string().required('Answer is required'),
});

export const AdminPuzzleForm = ({initialValues, onSubmit}: AdminPuzzleFormProps) => {
  const {commonStyles} = useStyles();
  const styles = StyleSheet.create({
    field: {
      ...commonStyles.paddingBottomSmall,
    },
  });

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={validationSchema}
      enableReinitialize={true}>
      {({handleSubmit, isSubmitting, isValid, values}) => (
        <View>
          <DirtyDetectionField />
          <TextField name={'title'} testID={'puzzleTitle-field'} label={'Title'} />
          <TextField name={'body'} testID={'puzzleBody-field'} label={'Body'} multiline={true} numberOfLines={6} />
          <TextField name={'answer'} testID={'puzzleAnswer-field'} label={'Answer'} />
          <BooleanField
            name={'clearUnlockTime'}
            testID={'puzzleClearUnlock-field'}
            label={'No unlock time'}
            helperText={'When on, the puzzle is available immediately and any scheduled unlock is cleared.'}
          />
          {!values.clearUnlockTime && (
            <>
              <View style={styles.field}>
                <DatePickerField name={'unlockTimeDate'} testID={'puzzleUnlockDate-button'} label={'Unlock Date'} />
              </View>
              <View style={styles.field}>
                <TimePickerField name={'unlockTimeTime'} testID={'puzzleUnlockTime-button'} />
              </View>
            </>
          )}
          <TextField
            name={'hintsJson'}
            testID={'puzzleHints-field'}
            label={'Hints JSON'}
            multiline={true}
            numberOfLines={4}
            infoText={'Object of string keys to hint text. Existing hints can be updated; they cannot be deleted.'}
          />
          <PrimaryActionButton
            testID={'puzzleSave-button'}
            buttonText={'Save'}
            onPress={handleSubmit}
            disabled={!isValid || isSubmitting}
            isLoading={isSubmitting}
          />
        </View>
      )}
    </Formik>
  );
};
