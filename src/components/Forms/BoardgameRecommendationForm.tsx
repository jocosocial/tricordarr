import {Formik, FormikHelpers} from 'formik';
import * as Yup from 'yup';
import {NumberValidation} from '../../Libraries/ValidationSchema.ts';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useStyles} from '../Context/Contexts/StyleContext.ts';
import {PrimaryActionButton} from '../Buttons/PrimaryActionButton.tsx';
import {BoardgameRecommendationData} from '../../Libraries/Structs/ControllerStructs.tsx';
import {BoardgameNumPlayersPickerField} from './Fields/Boardgames/BoardgameNumPlayersPickerField.tsx';
import {BoardgameAgePickerField} from './Fields/Boardgames/BoardgameAgePickerField.tsx';
import {BoardgameDurationPickerField} from './Fields/Boardgames/BoardgameDurationPickerField.tsx';
import {BoardgameComplexityPickerField} from './Fields/Boardgames/BoardgameComplexityPickerField.tsx';

interface PersonalEventFormProps {
  onSubmit: (values: BoardgameRecommendationData, helpers: FormikHelpers<BoardgameRecommendationData>) => void;
  initialValues: BoardgameRecommendationData;
  buttonText?: string;
}

const validationSchema = Yup.object().shape({
  numPlayers: NumberValidation,
  timeToPlay: NumberValidation,
  maxAge: NumberValidation,
  complexity: NumberValidation,
});

export const BoardgameRecommendationForm = ({
  onSubmit,
  initialValues,
  buttonText = 'Recommend Games',
}: PersonalEventFormProps) => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    buttonContainer: commonStyles.marginTopSmall,
    fieldContainer: commonStyles.paddingBottom,
  });

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
      {({handleSubmit, values, isSubmitting, isValid}) => (
        <View>
          <View style={styles.fieldContainer}>
            <BoardgameNumPlayersPickerField value={values.numPlayers} />
          </View>
          <View style={styles.fieldContainer}>
            <BoardgameAgePickerField value={values.maxAge} />
          </View>
          <View style={styles.fieldContainer}>
            <BoardgameDurationPickerField value={values.timeToPlay} />
          </View>
          <BoardgameComplexityPickerField value={values.complexity} />
          <View style={styles.fieldContainer} />
          <PrimaryActionButton
            disabled={isSubmitting || !isValid}
            isLoading={isSubmitting}
            viewStyle={styles.buttonContainer}
            onPress={handleSubmit}
            buttonText={buttonText}
          />
        </View>
      )}
    </Formik>
  );
};
