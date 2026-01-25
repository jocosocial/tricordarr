import {Formik} from 'formik';
import React from 'react';
import {View} from 'react-native';
import * as Yup from 'yup';

import {SliderField} from '#src/Components/Forms/Fields/SliderField';
import {QuerySettingsFormValues} from '#src/Types/FormValues';

interface QuerySettingsFormProps {
  initialValues: QuerySettingsFormValues;
  onSubmit: (values: QuerySettingsFormValues) => void;
}

const validationSchema = Yup.object().shape({
  defaultPageSize: Yup.number().required(),
  cacheTimeDays: Yup.number().required(),
  retry: Yup.number().required(),
  staleTimeMinutes: Yup.number().required(),
  disruptionThreshold: Yup.number().required(),
  imageStaleTimeDays: Yup.number().required(),
});

export const QuerySettingsForm = (props: QuerySettingsFormProps) => {
  return (
    <Formik initialValues={props.initialValues} onSubmit={() => {}} validationSchema={validationSchema}>
      {({values}) => (
        <View>
          <SliderField
            value={values.defaultPageSize}
            maximumValue={50}
            minimumValue={5}
            step={5}
            label={'Page Size'}
            name={'defaultPageSize'}
            helperText={'Number of results in each page of paginated responses.'}
            onSlidingComplete={() => props.onSubmit(values)}
          />
          <SliderField
            value={values.retry}
            maximumValue={5}
            minimumValue={0}
            step={1}
            label={'Retries'}
            name={'retry'}
            helperText={'Number of retry attempts to make if a query fails.'}
            onSlidingComplete={() => props.onSubmit(values)}
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
            onSlidingComplete={() => props.onSubmit(values)}
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
            onSlidingComplete={() => props.onSubmit(values)}
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
            onSlidingComplete={() => props.onSubmit(values)}
          />
          <SliderField
            value={values.imageStaleTimeDays}
            maximumValue={30}
            minimumValue={1}
            step={1}
            label={'Image Stale Time'}
            name={'imageStaleTimeDays'}
            helperText={'Amount of time for image response data to be considered fresh before automatically refreshed.'}
            unit={'day'}
            onSlidingComplete={() => props.onSubmit(values)}
          />
        </View>
      )}
    </Formik>
  );
};
