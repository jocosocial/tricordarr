import {Formik, FormikHelpers} from 'formik';
import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import * as Yup from 'yup';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {DatePickerField} from '#src/Components/Forms/Fields/DatePickerField';
import {DirtyDetectionField} from '#src/Components/Forms/Fields/DirtyDetectionField';
import {DurationPickerField} from '#src/Components/Forms/Fields/DurationPickerField';
import {ImagesField} from '#src/Components/Forms/Fields/ImagesField';
import {SuggestedTextField} from '#src/Components/Forms/Fields/SuggestedTextField';
import {TextField} from '#src/Components/Forms/Fields/TextField';
import {TimePickerField} from '#src/Components/Forms/Fields/TimePickerField';
import {UserChipsField} from '#src/Components/Forms/Fields/UserChipsField';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {PRIVATE_EVENT_MAX_IMAGES} from '#src/Libraries/ImageUpload';
import {getUserSuggestedLocations} from '#src/Libraries/Ship';
import {DateValidation, InfoStringValidation} from '#src/Libraries/ValidationSchema';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';
import {FezFormValues} from '#src/Types/FormValues';

interface PersonalEventFormProps {
  onSubmit: (values: FezFormValues, helpers: FormikHelpers<FezFormValues>) => void;
  initialValues: FezFormValues;
  buttonText?: string;
  create?: boolean;
}

const validationSchema = Yup.object().shape({
  title: InfoStringValidation,
  startDate: DateValidation,
  info: InfoStringValidation,
  location: InfoStringValidation,
  images: Yup.array().max(PRIVATE_EVENT_MAX_IMAGES, 'You can attach at most 1 photo.'),
});

export const PersonalEventForm = ({
  onSubmit,
  initialValues,
  buttonText = 'Save',
  create = true,
}: PersonalEventFormProps) => {
  const {commonStyles} = useStyles();
  const {data: profilePublicData} = useUserProfileQuery();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        buttonContainer: {
          ...commonStyles.marginTopSmall,
        },
        fieldSpacing: {
          ...commonStyles.paddingBottom,
        },
      }),
    [commonStyles],
  );

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
      {({handleSubmit, values, isSubmitting, isValid, dirty}) => (
        <View>
          <DirtyDetectionField />
          <TextField name={'title'} testID={'personalEventTitle-input'} label={'Title'} />
          <TextField
            name={'info'}
            testID={'personalEventInfo-input'}
            label={'Info'}
            multiline={true}
            numberOfLines={3}
          />
          <SuggestedTextField
            name={'location'}
            testID={'personalEventLocation-input'}
            label={'Location'}
            autoCapitalize={'words'}
            suggestions={getUserSuggestedLocations(profilePublicData)}
          />
          <View style={styles.fieldSpacing}>
            <DatePickerField name={'startDate'} testID={'personalEventStartDate-button'} />
          </View>
          <View style={styles.fieldSpacing}>
            <TimePickerField name={'startTime'} testID={'personalEventStartTime-button'} />
          </View>
          <View style={styles.fieldSpacing}>
            <DurationPickerField
              name={'duration'}
              testID={'personalEventDuration-button'}
              label={'Duration'}
              value={values.duration}
            />
          </View>
          {create && (
            <View style={styles.fieldSpacing}>
              <UserChipsField
                name={'initialUsers'}
                testID={'personalEventParticipants-input'}
                label={'Participants (Optional)'}
              />
            </View>
          )}
          <ImagesField name={'images'} maxPhotos={PRIVATE_EVENT_MAX_IMAGES} testIDPrefix={'personalEvent'} />
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
