import {Formik, FormikHelpers} from 'formik';
import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import * as Yup from 'yup';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {DirtyDetectionField} from '#src/Components/Forms/Fields/DirtyDetectionField';
import {SuggestedTextField} from '#src/Components/Forms/Fields/SuggestedTextField';
import {TextField} from '#src/Components/Forms/Fields/TextField';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {publicLocationSuggestions} from '#src/Libraries/Ship';
import {InfoStringValidation} from '#src/Libraries/ValidationSchema';
import {EventFeedbackData} from '#src/Structs/ControllerStructs';

interface EventFeedbackFormProps {
  onSubmit: (values: EventFeedbackData, helpers: FormikHelpers<EventFeedbackData>) => void;
  initialValues: EventFeedbackData;
  buttonText?: string;
  isEdit?: boolean;
}

const optionalFeedbackText = Yup.string()
  .max(2000, 'Must be less than 2000 characters.')
  .test('maxLines', 'Must be less than 25 lines', value => {
    if (!value) {
      return true;
    }
    return value.split(/\r\n|\r|\n/).length <= 25;
  });

const validationSchema = Yup.object().shape({
  eventLocation: InfoStringValidation,
  hostName: Yup.string().required('Cannot be empty.').max(80),
  attendance: Yup.string().max(40),
  recapString: optionalFeedbackText,
  issuesString: optionalFeedbackText,
});

/**
 * Host-side shadow event feedback fields. Title is read-only; location is editable; time stays on the selected event.
 */
export const EventFeedbackForm = ({
  onSubmit,
  initialValues,
  buttonText = 'Submit',
  isEdit = false,
}: EventFeedbackFormProps) => {
  const {commonStyles} = useStyles();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        buttonContainer: commonStyles.marginTopSmall,
      }),
    [commonStyles.marginTopSmall],
  );

  return (
    <Formik
      enableReinitialize={true}
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={validationSchema}>
      {({handleSubmit, isSubmitting, isValid, dirty}) => (
        <View>
          <DirtyDetectionField />
          <TextField name={'eventTitle'} testID={'eventFeedbackTitle-input'} label={'Event'} disabled={true} />
          <SuggestedTextField
            name={'eventLocation'}
            testID={'eventFeedbackLocation-input'}
            label={'Location'}
            autoCapitalize={'words'}
            suggestions={publicLocationSuggestions}
          />
          <TextField
            name={'hostName'}
            testID={'eventFeedbackHostName-input'}
            label={'Your Name'}
            autoCapitalize={'words'}
            maxLength={80}
          />
          <TextField
            name={'attendance'}
            testID={'eventFeedbackAttendance-input'}
            label={'Attendance Estimate'}
            maxLength={40}
          />
          <TextField
            name={'recapString'}
            testID={'eventFeedbackRecap-input'}
            label={'How did everything go?'}
            multiline={true}
            numberOfLines={5}
            maxLength={2000}
            autoCapitalize={'sentences'}
          />
          <TextField
            name={'issuesString'}
            testID={'eventFeedbackIssues-input'}
            label={'Any issues?'}
            multiline={true}
            numberOfLines={5}
            maxLength={2000}
            autoCapitalize={'sentences'}
          />
          <PrimaryActionButton
            disabled={isSubmitting || !isValid || (isEdit && !dirty)}
            isLoading={isSubmitting}
            viewStyle={styles.buttonContainer}
            onPress={handleSubmit}
            buttonText={buttonText}
            testID={'eventFeedbackSubmit-button'}
          />
        </View>
      )}
    </Formik>
  );
};
