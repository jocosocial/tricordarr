import {Formik, FormikHelpers} from 'formik';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import * as Yup from 'yup';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {BoardgameAgePickerField} from '#src/Components/Forms/Fields/Boardgames/BoardgameAgePickerField';
import {BoardgameComplexityPickerField} from '#src/Components/Forms/Fields/Boardgames/BoardgameComplexityPickerField';
import {BoardgameDurationPickerField} from '#src/Components/Forms/Fields/Boardgames/BoardgameDurationPickerField';
import {BoardgameNumPlayersPickerField} from '#src/Components/Forms/Fields/Boardgames/BoardgameNumPlayersPickerField';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {NumberValidation} from '#src/Libraries/ValidationSchema';
import {BoardgameRecommendationData} from '#src/Structs/ControllerStructs';

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
