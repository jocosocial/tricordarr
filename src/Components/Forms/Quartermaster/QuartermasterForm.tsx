import {Formik, FormikHelpers} from 'formik';
import React, {useMemo, useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import * as Yup from 'yup';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {AvatarImageField} from '#src/Components/Forms/Fields/AvatarImageField';
import {BooleanField} from '#src/Components/Forms/Fields/BooleanField';
import {DirtyDetectionField} from '#src/Components/Forms/Fields/DirtyDetectionField';
import {PickerField} from '#src/Components/Forms/Fields/PickerField';
import {SuggestedTextField} from '#src/Components/Forms/Fields/SuggestedTextField';
import {TextField} from '#src/Components/Forms/Fields/TextField';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {QuartermasterCategory} from '#src/Enums/QuartermasterCategory';
import {
  QUARTERMASTER_DESCRIPTION_MAX,
  QUARTERMASTER_LOCATION_MAX,
  QUARTERMASTER_LOCATION_MIN,
  QUARTERMASTER_NAME_MAX,
  QUARTERMASTER_NAME_MIN,
} from '#src/Libraries/Quartermaster/QuartermasterForm';
import {getUserSuggestedLocations} from '#src/Libraries/Ship';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';
import {QuartermasterFormValues} from '#src/Types/FormValues';

interface QuartermasterFormProps {
  initialValues: QuartermasterFormValues;
  /**
   * Handles the primary Save. Must be `async` and `await` its mutation, so Formik keeps
   * `isSubmitting` (and with it both buttons) disabled for the whole request.
   */
  onSubmit: (values: QuartermasterFormValues, helpers: FormikHelpers<QuartermasterFormValues>) => Promise<void>;
  /**
   * When provided, a "Save & Add Another" button is shown. It follows the same `async` contract
   * as `onSubmit`, and is responsible for resetting the form for the next item.
   */
  onSubmitAndAddAnother?: (
    values: QuartermasterFormValues,
    helpers: FormikHelpers<QuartermasterFormValues>,
  ) => Promise<void>;
  buttonText?: string;
}

const validationSchema = Yup.object().shape({
  category: Yup.mixed<QuartermasterCategory>().oneOf(QuartermasterCategory.all).required(),
  itemName: Yup.string().trim().min(QUARTERMASTER_NAME_MIN).max(QUARTERMASTER_NAME_MAX).required('Cannot be empty.'),
  itemDescription: Yup.string().max(QUARTERMASTER_DESCRIPTION_MAX),
  location: Yup.string()
    .trim()
    .max(QUARTERMASTER_LOCATION_MAX)
    .when('hideOwnerName', {
      is: true,
      then: schema => schema.min(QUARTERMASTER_LOCATION_MIN).required('A location is required when hiding your name.'),
      otherwise: schema =>
        schema.test(
          'location-min',
          `Must be at least ${QUARTERMASTER_LOCATION_MIN} characters.`,
          value => !value || value.length >= QUARTERMASTER_LOCATION_MIN,
        ),
    }),
});

/**
 * Create/edit form for a Quartermastarr item. One item at a time: "Save & Add Another" on the
 * create screen covers batches without a multi-row form.
 */
export const QuartermasterForm = ({
  initialValues,
  onSubmit,
  onSubmitAndAddAnother,
  buttonText = 'Save',
}: QuartermasterFormProps) => {
  const {commonStyles} = useStyles();
  const {data: profilePublicData} = useUserProfileQuery();
  // Which button started the submit. Formik has one onSubmit, so the secondary button flags
  // itself here before calling handleSubmit.
  const addAnotherRef = useRef(false);
  // Mirrors the ref for rendering, so the spinner lands on the button that was pressed.
  const [addingAnother, setAddingAnother] = useState(false);
  const styles = useMemo(
    () =>
      StyleSheet.create({
        buttons: {
          ...commonStyles.marginTopSmall,
          ...commonStyles.gapSmall,
        },
      }),
    [commonStyles],
  );

  const handleSubmit = async (values: QuartermasterFormValues, helpers: FormikHelpers<QuartermasterFormValues>) => {
    const addAnother = addAnotherRef.current;
    addAnotherRef.current = false;
    try {
      if (addAnother && onSubmitAndAddAnother) {
        await onSubmitAndAddAnother(values, helpers);
      } else {
        await onSubmit(values, helpers);
      }
    } finally {
      setAddingAnother(false);
    }
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit} validationSchema={validationSchema}>
      {({handleSubmit: submitForm, isSubmitting, isValid, dirty, values}) => (
        <View>
          <DirtyDetectionField />
          <AvatarImageField<QuartermasterFormValues>
            name={'image'}
            testIDPrefix={'quartermasterImage'}
            imageData={initialValues.image}
            disableDelete={!values.image.filename && !values.image.image}
          />
          <PickerField<QuartermasterCategory>
            name={'category'}
            testID={'quartermasterCategory-picker'}
            label={'Category'}
            value={values.category}
            choices={QuartermasterCategory.all}
            getTitle={category => (category ? QuartermasterCategory.getDescription(category) : 'Select')}
          />
          <TextField
            name={'itemName'}
            testID={'quartermasterName-input'}
            label={'Item Name'}
            autoCapitalize={'sentences'}
            maxLength={QUARTERMASTER_NAME_MAX}
          />
          <TextField
            name={'itemDescription'}
            testID={'quartermasterDescription-input'}
            label={'Description (optional)'}
            autoCapitalize={'sentences'}
            multiline={true}
            numberOfLines={3}
            maxLength={QUARTERMASTER_DESCRIPTION_MAX}
          />
          <SuggestedTextField
            name={'location'}
            testID={'quartermasterLocation-input'}
            label={'Location (optional)'}
            autoCapitalize={'sentences'}
            maxLength={QUARTERMASTER_LOCATION_MAX}
            suggestions={getUserSuggestedLocations(profilePublicData)}
          />
          <BooleanField
            name={'hideOwnerName'}
            testID={'quartermasterHideOwner-switch'}
            label={'Post anonymously'}
            helperText={'Hides your name from other users. A location is required so people can find you.'}
          />
          <View style={styles.buttons}>
            <PrimaryActionButton
              disabled={isSubmitting || !isValid || !dirty}
              isLoading={isSubmitting && !addingAnother}
              onPress={() => {
                addAnotherRef.current = false;
                submitForm();
              }}
              buttonText={buttonText}
              testID={'quartermasterSubmit-button'}
            />
            {onSubmitAndAddAnother && (
              <PrimaryActionButton
                disabled={isSubmitting || !isValid || !dirty}
                isLoading={isSubmitting && addingAnother}
                onPress={() => {
                  addAnotherRef.current = true;
                  setAddingAnother(true);
                  submitForm();
                }}
                buttonText={'Save & Add Another'}
                testID={'quartermasterSubmitAddAnother-button'}
              />
            )}
          </View>
        </View>
      )}
    </Formik>
  );
};
