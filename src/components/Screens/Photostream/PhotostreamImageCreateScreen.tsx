import React, {useState} from 'react';
import {Text} from 'react-native-paper';
import {AppView} from '../../Views/AppView.tsx';
import {usePhotostreamLocationDataQuery} from '../../Queries/Photostream/PhotostreamQueries.tsx';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import {RefreshControl} from 'react-native';
import {PickerField} from '../../Forms/Fields/PickerField.tsx';
import {PhotostreamImageCreateForm} from '../../Forms/Photostream/PhotostreamImageCreateForm.tsx';
import {FezFormValues, PhotostreamCreateFormValues} from '../../../libraries/Types/FormValues.ts';
import {FormikHelpers} from 'formik';

export const PhotostreamImageCreateScreen = () => {
  const {data: locationData, refetch: refetchLocationData} = usePhotostreamLocationDataQuery();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchLocationData();
    setRefreshing(false);
  };

  console.log(locationData);
  const onSubmit = (values: PhotostreamCreateFormValues, helpers: FormikHelpers<PhotostreamCreateFormValues>) => {
    helpers.setSubmitting(false);
    console.log(values);
  };

  return (
    <AppView>
      <ScrollingContentView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <PhotostreamImageCreateForm
          initialValues={{
            locationName: undefined,
            eventData: undefined,
            createdAt: new Date(),
          }}
          locations={locationData.locations}
          events={locationData.events}
          onSubmit={onSubmit}
        />
      </ScrollingContentView>
    </AppView>
  );
};
