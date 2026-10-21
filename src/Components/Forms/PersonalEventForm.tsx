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
   * visibility. On edit only the owner of an existing privateEvent may change it: the server
   * refuses a visibility change on any other type, and an event created without guests is a
   * personalEvent that can never become unlisted.
   */
  showVisibility?: boolean;
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
}: PersonalEventFormProps) => {
  const {commonStyles} = useStyles();
  const styles = {
    inputContainer: [],
    buttonContainer: [commonStyles.marginTopSmall],
  };
  const {data: profilePublicData} = useUserProfileQuery();

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
          {create && (
            <UserChipsField
              name={'initialUsers'}
              testID={'personalEventParticipants-input'}
              label={'Participants (Optional)'}
            />
          )}
          {showVisibility && (
            <BooleanField
              name={'visibility'}
              testID={'personalEventUnlisted-switch'}
              label={'Unlisted'}
              helperText={'Lets anyone with the link view and join this event.'}
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
