import {Formik, FormikHelpers} from 'formik';
import React from 'react';
import {View} from 'react-native';
import * as Yup from 'yup';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {BooleanField} from '#src/Components/Forms/Fields/BooleanField';
import {DatePickerField} from '#src/Components/Forms/Fields/DatePickerField';
import {DirtyDetectionField} from '#src/Components/Forms/Fields/DirtyDetectionField';
import {DurationPickerField} from '#src/Components/Forms/Fields/DurationPickerField';
import {SuggestedTextField} from '#src/Components/Forms/Fields/SuggestedTextField';
import {TextField} from '#src/Components/Forms/Fields/TextField';
import {TimePickerField} from '#src/Components/Forms/Fields/TimePickerField';
import {UserChipsField} from '#src/Components/Forms/Fields/UserChipsField';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {FezVisibility} from '#src/Enums/FezVisibility';
import {getUserSuggestedLocations} from '#src/Libraries/Ship';
import {DateValidation, InfoStringValidation} from '#src/Libraries/ValidationSchema';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';
import {FezFormValues} from '#src/Types/FormValues';

interface PersonalEventFormProps {
  onSubmit: (values: FezFormValues, helpers: FormikHelpers<FezFormValues>) => void;
  initialValues: FezFormValues;
  buttonText?: string;
  create?: boolean;
  /**
   * Show the Unlisted switch. Defaults to `create`, since a new event can always pick its
   * visibility. On edit only the owner may change it: on a privateEvent directly, and on a
   * personalEvent by converting it (one-way) into a privateEvent. The server refuses a visibility
   * change from anyone else.
   */
  showVisibility?: boolean;
  /**
   * Show the Participants field. Defaults to `create`. On edit it's only meaningful for the owner
   * of a personalEvent, where adding anyone converts it into a privateEvent. In pre-registration
   * mode the field is shown but disabled, since other users can't be added yet.
   */
  showParticipants?: boolean;
}

const validationSchema = Yup.object().shape({
  title: InfoStringValidation,
  startDate: DateValidation,
  info: InfoStringValidation,
  location: InfoStringValidation,
});

export const PersonalEventForm = ({
  onSubmit,
  initialValues,
  buttonText = 'Save',
  create = true,
  showVisibility = create,
  showParticipants = create,
}: PersonalEventFormProps) => {
  const {commonStyles} = useStyles();
  const styles = {
    inputContainer: [],
    buttonContainer: [commonStyles.marginTopSmall],
  };
  const {data: profilePublicData} = useUserProfileQuery();
  const {preRegistrationMode} = usePreRegistration();

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
      {({handleSubmit, values, isSubmitting, isValid, dirty, setFieldValue}) => (
        <View>
          <DirtyDetectionField />
          <TextField
            viewStyle={styles.inputContainer}
            name={'title'}
            testID={'personalEventTitle-input'}
            label={'Title'}
          />
          <TextField
            viewStyle={styles.inputContainer}
            name={'info'}
            testID={'personalEventInfo-input'}
            label={'Info'}
            multiline={true}
            numberOfLines={3}
          />
          <SuggestedTextField
            viewStyle={styles.inputContainer}
            name={'location'}
            testID={'personalEventLocation-input'}
            label={'Location'}
            autoCapitalize={'words'}
            suggestions={getUserSuggestedLocations(profilePublicData)}
          />
          <View style={[commonStyles.paddingBottom]}>
            <DatePickerField name={'startDate'} testID={'personalEventStartDate-button'} limitRange={true} />
          </View>
          <View style={[commonStyles.paddingBottom]}>
            <TimePickerField name={'startTime'} testID={'personalEventStartTime-button'} />
          </View>
          <View style={[commonStyles.paddingBottom]}>
            <DurationPickerField
              name={'duration'}
              testID={'personalEventDuration-button'}
              label={'Duration'}
              value={values.duration}
            />
          </View>
          {showParticipants && (
            <UserChipsField
              name={'initialUsers'}
              testID={'personalEventParticipants-input'}
              label={'Participants (Optional)'}
              disabled={preRegistrationMode}
              helperText={preRegistrationMode ? "You'll be able to invite others once we're on board." : undefined}
            />
          )}
          {showVisibility && (
            <BooleanField
              name={'visibility'}
              testID={'personalEventUnlisted-switch'}
              label={'Unlisted'}
              helperText={
                preRegistrationMode
                  ? "Lets anyone with the link view and join this event. People won't be able to see or join it until we're on board."
                  : 'Lets anyone with the link view and join this event.'
              }
              onPress={() =>
                setFieldValue(
                  'visibility',
                  values.visibility === FezVisibility.unlisted ? FezVisibility.private : FezVisibility.unlisted,
                )
              }
              value={values.visibility === FezVisibility.unlisted}
            />
          )}
          <PrimaryActionButton
            disabled={!values.title || isSubmitting || !isValid || !dirty}
            isLoading={isSubmitting}
            viewStyle={styles.buttonContainer}
            onPress={handleSubmit}
            buttonText={buttonText}
            testID={'personalEventSubmit-button'}
          />
        </View>
      )}
    </Formik>
  );
};
