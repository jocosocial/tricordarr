import {Formik, FormikHelpers} from 'formik';
import {PickerField} from '../Fields/PickerField.tsx';
import React from 'react';
import {PhotostreamCreateFormValues} from '../../../libraries/Types/FormValues.ts';
import * as Yup from 'yup';
import {EventData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {View} from 'react-native';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton.tsx';
import {PhotostreamImageSelectionView} from '../../Views/Photostream/PhotostreamImageSelectionView.tsx';

interface PhotostreamImageCreateFormProps {
  onSubmit: (values: PhotostreamCreateFormValues, helpers: FormikHelpers<PhotostreamCreateFormValues>) => void;
  initialValues: PhotostreamCreateFormValues;
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
    console.log('Testing Something', locationName, eventData, locationName !== undefined || eventData !== undefined);
    return locationName !== undefined || eventData !== undefined;
  });

export const PhotostreamImageCreateForm = ({
  onSubmit,
  initialValues,
  locations,
  events,
}: PhotostreamImageCreateFormProps) => {
  const {commonStyles} = useStyles();

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
          <View style={[commonStyles.paddingBottom]}>
            <PickerField<string>
              name={'locationName'}
              label={'Location'}
              choices={locations}
              value={values.locationName}
              getTitle={getLocationTitle}
              addUndefinedOption={true}
            />
          </View>
          <View style={[commonStyles.paddingBottom]}>
            <PickerField<EventData>
              name={'eventData'}
              label={'Event'}
              choices={events}
              value={values.eventData}
              getTitle={getEventTitle}
              addUndefinedOption={true}
            />
          </View>
          <PrimaryActionButton
            disabled={!(values.eventData || values.locationName) || isSubmitting || !isValid}
            isLoading={isSubmitting}
            viewStyle={[commonStyles.marginTopSmall]}
            onPress={handleSubmit}
            buttonText={'Post'}
          />
        </View>
      )}
    </Formik>
  );
};
