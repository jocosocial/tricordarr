import React, {useState} from 'react';
import {AppView} from '../../Views/AppView.tsx';
import {
  usePhotostreamImageUploadMutation,
  usePhotostreamLocationDataQuery,
} from '../../Queries/Photostream/PhotostreamQueries.tsx';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import {RefreshControl} from 'react-native';
import {PhotostreamImageCreateForm} from '../../Forms/Photostream/PhotostreamImageCreateForm.tsx';
import {PhotostreamCreateFormValues} from '../../../libraries/Types/FormValues.ts';
import {FormikHelpers} from 'formik';
import {LoadingView} from '../../Views/Static/LoadingView.tsx';
import {PhotostreamUploadData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MainStackComponents} from '../../../libraries/Enums/Navigation.ts';
import {MainStackParamList} from '../../Navigation/Stacks/MainStackNavigator.tsx';

export type Props = NativeStackScreenProps<MainStackParamList, MainStackComponents.photostreamImageCreateScreen>;

export const PhotostreamImageCreateScreen = ({navigation}: Props) => {
  const {data: locationData, refetch: refetchLocationData} = usePhotostreamLocationDataQuery();
  const [refreshing, setRefreshing] = useState(false);
  const uploadMutation = usePhotostreamImageUploadMutation();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchLocationData();
    setRefreshing(false);
  };

  const onSubmit = (values: PhotostreamCreateFormValues, helpers: FormikHelpers<PhotostreamCreateFormValues>) => {
    const payload: PhotostreamUploadData = {
      createdAt: new Date().toISOString(), // @TODO extract the date from the image
      ...(values.locationName ? {locationName: values.locationName} : undefined),
      ...(values.eventData ? {eventData: values.eventData.eventID} : undefined),
      image: 'aaa',
    };
    uploadMutation.mutate(
      {
        imageUploadData: payload,
      },
      {
        onSuccess: () => {
          navigation.goBack();
        },
        onSettled: () => {
          helpers.setSubmitting(false);
        },
      },
    );
  };

  if (!locationData) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ScrollingContentView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <PhotostreamImageCreateForm
          initialValues={{
            locationName: undefined,
            eventData: undefined,
          }}
          locations={locationData.locations}
          events={locationData.events}
          onSubmit={onSubmit}
        />
      </ScrollingContentView>
    </AppView>
  );
};
