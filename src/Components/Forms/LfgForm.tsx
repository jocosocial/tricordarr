import {Formik, FormikHelpers} from 'formik';
import React from 'react';
import {View} from 'react-native';
import * as Yup from 'yup';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {DatePickerField} from '#src/Components/Forms/Fields/DatePickerField';
import {DirtyDetectionField} from '#src/Components/Forms/Fields/DirtyDetectionField';
import {DurationPickerField} from '#src/Components/Forms/Fields/DurationPickerField';
import {FezTypePickerField} from '#src/Components/Forms/Fields/FezTypePickerField';
import {SuggestedTextField} from '#src/Components/Forms/Fields/SuggestedTextField';
import {TextField} from '#src/Components/Forms/Fields/TextField';
import {TimePickerField} from '#src/Components/Forms/Fields/TimePickerField';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {publicLocationSuggestions} from '#src/Libraries/Ship';
import {
  DateValidation,
  InfoStringValidation,
  IntegerValidation,
  LFGTypeValidation,
} from '#src/Libraries/ValidationSchema';
import {FezFormValues} from '#src/Types/FormValues';

interface LfgFormProps {
  onSubmit: (values: FezFormValues, helpers: FormikHelpers<FezFormValues>) => void;
  initialValues: FezFormValues;
  buttonText?: string;
}

const validationSchema = Yup.object().shape({
  title: InfoStringValidation,
  location: InfoStringValidation,
  info: InfoStringValidation,
  minCapacity: IntegerValidation.min(1).max(3),
  maxCapacity: IntegerValidation.min(1).max(3),
  fezType: LFGTypeValidation,
  startDate: DateValidation,
});

export const LfgForm = ({onSubmit, initialValues, buttonText = 'Create'}: LfgFormProps) => {
  const {commonStyles} = useStyles();
  const styles = {
    inputContainer: [],
    buttonContainer: [commonStyles.marginTopSmall],
  };

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
      {({handleSubmit, values, isSubmitting, isValid, dirty}) => (
        <View>
          <DirtyDetectionField />
          <TextField
            viewStyle={styles.inputContainer}
            name={'title'}
            testID={'lfgTitle-input'}
            label={'Title'}
            autoCapitalize={'words'}
          />
          <SuggestedTextField
            viewStyle={styles.inputContainer}
            name={'location'}
            testID={'lfgLocation-input'}
            label={'Location'}
            autoCapitalize={'words'}
            suggestions={publicLocationSuggestions}
          />
          <View style={[commonStyles.paddingBottom]}>
            <FezTypePickerField name={'fezType'} testID={'lfgType-button'} label={'Type'} value={values.fezType} />
          </View>
          <View style={[commonStyles.paddingBottom]}>
            <DatePickerField name={'startDate'} testID={'lfgStartDate-button'} limitRange={true} />
          </View>
          <View style={[commonStyles.paddingBottom]}>
            <TimePickerField name={'startTime'} testID={'lfgStartTime-button'} />
          </View>
          <View style={[commonStyles.paddingBottom]}>
            <DurationPickerField
              name={'duration'}
              testID={'lfgDuration-button'}
              label={'Duration'}
              value={values.duration}
            />
          </View>
          <TextField
            viewStyle={styles.inputContainer}
            name={'minCapacity'}
            testID={'lfgMinCapacity-input'}
            label={'Minimum Attendees Needed'}
            keyboardType={'numeric'}
          />
          <TextField
            viewStyle={styles.inputContainer}
            name={'maxCapacity'}
            testID={'lfgMaxCapacity-input'}
            label={'Maximum Attendees Desired'}
            keyboardType={'numeric'}
          />
          <TextField
            viewStyle={styles.inputContainer}
            name={'info'}
            testID={'lfgInfo-input'}
            label={'Event Info'}
            multiline={true}
            numberOfLines={3}
          />
          <PrimaryActionButton
            disabled={!values.title || isSubmitting || !isValid || !dirty}
            isLoading={isSubmitting}
            viewStyle={styles.buttonContainer}
            onPress={handleSubmit}
            buttonText={buttonText}
            testID={'lfgSubmit-button'}
          />
        </View>
      )}
    </Formik>
  );
};
