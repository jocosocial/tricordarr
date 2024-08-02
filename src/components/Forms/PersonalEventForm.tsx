import {PersonalEventFormValues} from '../../libraries/Types/FormValues.ts';
import {Formik, FormikHelpers} from 'formik';
import * as Yup from 'yup';
import {DateValidation, InfoStringValidation} from '../../libraries/ValidationSchema.ts';
import {DirtyDetectionField} from './Fields/DirtyDetectionField.tsx';
import {TextField} from './Fields/TextField.tsx';
import React from 'react';
import {View} from 'react-native';
import {useStyles} from '../Context/Contexts/StyleContext.ts';
import {PrimaryActionButton} from '../Buttons/PrimaryActionButton.tsx';
import {DatePickerField} from './Fields/DatePickerField.tsx';
import {TimePickerField} from './Fields/TimePickerField.tsx';
import {DurationPickerField} from './Fields/DurationPickerField.tsx';
import {UserChipsField} from './Fields/UserChipsField.tsx';

interface PersonalEventFormProps {
  onSubmit: (values: PersonalEventFormValues, helpers: FormikHelpers<PersonalEventFormValues>) => void;
  initialValues: PersonalEventFormValues;
  buttonText?: string;
}

const validationSchema = Yup.object().shape({
  title: InfoStringValidation,
  startDate: DateValidation,
});

export const PersonalEventForm = ({onSubmit, initialValues, buttonText = 'Save'}: PersonalEventFormProps) => {
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
          <TextField viewStyle={styles.inputContainer} name={'title'} label={'Title'} autoCapitalize={'words'} />
          <TextField
            viewStyle={styles.inputContainer}
            name={'description'}
            label={'Description'}
            multiline={true}
            numberOfLines={3}
          />
          <TextField viewStyle={styles.inputContainer} name={'location'} label={'Location'} autoCapitalize={'words'} />
          <View style={[commonStyles.paddingBottom]}>
            <DatePickerField name={'startDate'} />
          </View>
          <View style={[commonStyles.paddingBottom]}>
            <TimePickerField name={'startTime'} />
          </View>
          <View style={[commonStyles.paddingBottom]}>
            <DurationPickerField name={'duration'} label={'Duration'} value={values.duration} />
          </View>
          <View style={[commonStyles.paddingBottom]}>
            <UserChipsField
              name={'participants'}
              label={'Participants'}
              labelSubtext={'You can only add users that have favorited you.'}
              searchFavorersOnly={true}
            />
          </View>
          <PrimaryActionButton
            disabled={!values.title || isSubmitting || !isValid || !dirty}
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
