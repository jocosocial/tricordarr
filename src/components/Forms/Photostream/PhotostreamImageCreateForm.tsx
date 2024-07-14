import {Formik, FormikHelpers} from 'formik';
import {PickerField} from '../Fields/PickerField.tsx';
import React from 'react';
import {FezFormValues, PhotostreamCreateFormValues} from '../../../libraries/Types/FormValues.ts';
import * as Yup from 'yup';
import {
  DateValidation,
  FezTypeValidation,
  InfoStringValidation,
  NumberValidation,
} from '../../../libraries/ValidationSchema.ts';
import {EventData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {View} from 'react-native';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton.tsx';

interface PhotostreamImageCreateFormProps {
  onSubmit: (values: PhotostreamCreateFormValues, helpers: FormikHelpers<PhotostreamCreateFormValues>) => void;
  initialValues: PhotostreamCreateFormValues;
  locations: string[];
  events: EventData[];
}

const validationSchema = Yup.object().shape({
  // title: InfoStringValidation,
  // location: InfoStringValidation,
  // info: InfoStringValidation,
  // minCapacity: NumberValidation.min(1).max(3),
  // maxCapacity: NumberValidation.min(1).max(3),
  // fezType: FezTypeValidation,
  // startDate: DateValidation,
});

export const PhotostreamImageCreateForm = ({
  onSubmit,
  initialValues,
  locations,
  events,
}: PhotostreamImageCreateFormProps) => {
  const {commonStyles} = useStyles();

  const getLocationTitle = (value: string | number | undefined) => {
    if (value) {
      return value.toString();
    }
    return 'None';
  };

  const getEventTitle = (e: EventData | undefined) => {
    return e ? e.title : 'None';
  };

  const eventChoices = events.map(e => e.title);
  console.log(eventChoices);

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
      {({handleSubmit, values, isSubmitting, isValid}) => (
        <View>
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
            disabled={isSubmitting || !isValid}
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
