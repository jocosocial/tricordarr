import React from 'react';
import {View} from 'react-native';
import {Formik, FormikHelpers} from 'formik';
import * as Yup from 'yup';
import {QuerySettingsFormValues} from '../../../libraries/Types/FormValues.ts';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton.tsx';
import {SliderField} from '../Fields/SliderField.tsx';

interface QuerySettingsFormProps {
  initialValues: QuerySettingsFormValues;
  onSubmit: (values: QuerySettingsFormValues, helpers: FormikHelpers<QuerySettingsFormValues>) => void;
}

const validationSchema = Yup.object().shape({
  defaultPageSize: Yup.number().required(),
  cacheTimeDays: Yup.number().required(),
  retry: Yup.number().required(),
  staleTimeMinutes: Yup.number().required(),
  disruptionThreshold: Yup.number().required(),
});

export const QuerySettingsForm = (props: QuerySettingsFormProps) => {
  const {commonStyles} = useStyles();
  return (
    <Formik initialValues={props.initialValues} onSubmit={props.onSubmit} validationSchema={validationSchema}>
      {({values, handleSubmit, isSubmitting, isValid, dirty}) => (
        <View>
          <SliderField
            value={values.defaultPageSize}
            maximumValue={50}
            minimumValue={5}
            step={5}
            label={'Page Size'}
            name={'defaultPageSize'}
            helperText={'Number of results in each page of paginated responses.'}
          />
          <SliderField
            value={values.retry}
            maximumValue={5}
            minimumValue={0}
            step={1}
            label={'Retries'}
            name={'retry'}
            helperText={'Number of retry attempts to make if a query fails.'}
          />
          <SliderField
            value={values.disruptionThreshold}
            maximumValue={100}
            minimumValue={1}
            step={1}
            label={'Disruption Threshold'}
            name={'disruptionThreshold'}
            helperText={
              'Number of failed query attempts before the server is considered disrupted, disabling future automatic queries.'
            }
          />
          <SliderField
            value={values.staleTimeMinutes}
            maximumValue={10}
            minimumValue={0}
            step={1}
            label={'Stale Time'}
            name={'staleTimeMinutes'}
            helperText={'Amount of time for query response data to be considered fresh before automatically refreshed.'}
            unit={'minute'}
          />
          <SliderField
            value={values.cacheTimeDays}
            maximumValue={30}
            minimumValue={0}
            step={1}
            label={'Cache Time'}
            name={'cacheTimeDays'}
            helperText={'Amount of time for query response data to be cached.'}
            unit={'day'}
          />
          <SliderField
            value={values.imageStaleTimeHours}
            maximumValue={24}
            minimumValue={1}
            step={1}
            label={'Image Stale Time'}
            name={'imageStaleTimeHours'}
            helperText={'Amount of time for image response data to be considered fresh before automatically refreshed.'}
            unit={'hour'}
          />
          <PrimaryActionButton
            disabled={!isValid || isSubmitting || !dirty}
            isLoading={isSubmitting}
            viewStyle={commonStyles.marginTopSmall}
            onPress={handleSubmit}
            buttonText={'Save'}
          />
        </View>
      )}
    </Formik>
  );
};
