import {Formik, FormikHelpers} from 'formik';
import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import * as Yup from 'yup';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {TextField} from '#src/Components/Forms/Fields/TextField';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {PuzzleAnswerValidation} from '#src/Libraries/ValidationSchema';
import {HuntPuzzleCallInFormValues} from '#src/Types/FormValues';

const validationSchema = Yup.object().shape({
  puzzleAnswer: PuzzleAnswerValidation,
});

const initialFormValues: HuntPuzzleCallInFormValues = {
  puzzleAnswer: '',
};

interface HuntPuzzleCallInFormProps {
  onSubmit: (values: HuntPuzzleCallInFormValues, helpers: FormikHelpers<HuntPuzzleCallInFormValues>) => void;
}

/**
 * Answer submission form for an unsolved puzzle.
 */
export const HuntPuzzleCallInForm = ({onSubmit}: HuntPuzzleCallInFormProps) => {
  const {commonStyles} = useStyles();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        button: {
          ...commonStyles.marginTopSmall,
        },
      }),
    [commonStyles.marginTopSmall],
  );

  return (
    <Formik
      enableReinitialize
      initialValues={initialFormValues}
      onSubmit={onSubmit}
      validationSchema={validationSchema}>
      {({handleSubmit, isSubmitting, values}) => (
        <View>
          <TextField
            autoCapitalize={'none'}
            autoCorrect={false}
            spellCheck={false}
            name={'puzzleAnswer'}
            label={'Answer'}
            maxLength={100}
            trimOnBlur={true}
            testID={'puzzleAnswer-input'}
          />
          <PrimaryActionButton
            onPress={handleSubmit}
            buttonText={'Submit'}
            disabled={!values.puzzleAnswer.trim() || isSubmitting}
            isLoading={isSubmitting}
            style={styles.button}
            testID={'puzzleAnswerSubmit-button'}
          />
        </View>
      )}
    </Formik>
  );
};
