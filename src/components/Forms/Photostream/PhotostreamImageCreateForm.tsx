import {Formik, FormikHelpers} from 'formik';
import {PickerField} from '#src/Components/Forms/Fields/PickerField.tsx';
import React from 'react';
import {PhotostreamCreateFormValues} from '#src/Libraries/Types/FormValues.ts';
import * as Yup from 'yup';
import {EventData} from '#src/Libraries/Structs/ControllerStructs.tsx';
import {View} from 'react-native';
import {useStyles} from '#src/Components/Context/Contexts/StyleContext.ts';
import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton.tsx';
import {PhotostreamImageSelectionView} from '#src/Components/Views/Photostream/PhotostreamImageSelectionView.tsx';
import {Text} from 'react-native-paper';
import {StyleSheet} from 'react-native';

interface PhotostreamImageCreateFormProps {
  onSubmit: (values: PhotostreamCreateFormValues, helpers: FormikHelpers<PhotostreamCreateFormValues>) => void;
  initialValues?: PhotostreamCreateFormValues;
  locations: string[];
  events: EventData[];
}

const validationSchema = Yup.object()
  .shape({
    locationName: Yup.string(),
    eventData: Yup.object(),
  })
  .test('at-least-one', 'At least one of the fields must be provided', value => {
    const {locationName, eventData} = value;
    return locationName !== undefined || eventData !== undefined;
  });

export const PhotostreamImageCreateForm = ({
  onSubmit,
  initialValues = {locationName: undefined, eventData: undefined},
  locations,
  events,
}: PhotostreamImageCreateFormProps) => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    fieldWrapper: commonStyles.paddingBottom,
    submitButton: commonStyles.marginTopSmall,
    textWrapper: {
      ...commonStyles.flexRow,
      ...commonStyles.justifyCenter,
      ...commonStyles.paddingBottomSmall,
    },
  });

  const getLocationTitle = (value: string | undefined) => {
    if (value) {
      return value.toString();
    }
    return 'None';
  };

  const getEventTitle = (e: EventData | undefined) => {
    return e ? e.title : 'None';
  };

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
      {({handleSubmit, values, isSubmitting, isValid}) => (
        <View>
          <PhotostreamImageSelectionView />
          <View style={styles.fieldWrapper}>
            <PickerField<string>
              name={'locationName'}
              label={'Location'}
              choices={locations}
              value={values.locationName}
              getTitle={getLocationTitle}
              addUndefinedOption={true}
            />
          </View>
          <View style={styles.fieldWrapper}>
            <PickerField<EventData>
              name={'eventData'}
              label={'Event'}
              choices={events}
              value={values.eventData}
              getTitle={getEventTitle}
              addUndefinedOption={true}
            />
          </View>
          <View style={styles.textWrapper}>
            <Text variant={'labelMedium'}>
              You can only post one image every five minutes. It cannot be removed except by moderators. Any text will
              be automatically blurred. Choose wisely!
            </Text>
          </View>
          <PrimaryActionButton
            disabled={!(values.eventData || values.locationName) || isSubmitting || !isValid}
            isLoading={isSubmitting}
            viewStyle={styles.submitButton}
            onPress={handleSubmit}
            buttonText={'Post'}
          />
        </View>
      )}
    </Formik>
  );
};
