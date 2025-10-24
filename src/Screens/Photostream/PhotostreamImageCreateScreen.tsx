import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useQueryClient} from '@tanstack/react-query';
import {FormikHelpers} from 'formik';
import React, {useCallback, useEffect, useState} from 'react';
import {RefreshControl, View} from 'react-native';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButton} from '#src/Components/Buttons/MaterialHeaderButton';
import {PhotostreamImageCreateForm} from '#src/Components/Forms/Photostream/PhotostreamImageCreateForm';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {AppIcons} from '#src/Enums/Icons';
import {saveImageQueryToLocal} from '#src/Libraries/Storage/ImageStorage';
import {MainStackComponents, MainStackParamList} from '#src/Navigation/Stacks/MainStackNavigator';
import {usePhotostreamImageUploadMutation} from '#src/Queries/Photostream/PhotostreamMutations';
import {usePhotostreamLocationDataQuery} from '#src/Queries/Photostream/PhotostreamQueries';
import {PhotostreamUploadData} from '#src/Structs/ControllerStructs';
import {ImageQueryData} from '#src/Types';
import {PhotostreamCreateFormValues} from '#src/Types/FormValues';

export type Props = NativeStackScreenProps<MainStackParamList, MainStackComponents.photostreamImageCreateScreen>;

export const PhotostreamImageCreateScreen = ({navigation}: Props) => {
  const {data: locationData, refetch: refetchLocationData} = usePhotostreamLocationDataQuery();
  const [refreshing, setRefreshing] = useState(false);
  const uploadMutation = usePhotostreamImageUploadMutation();
  const queryClient = useQueryClient();
  const {appConfig} = useConfig();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchLocationData();
    setRefreshing(false);
  };

  const onSubmit = async (values: PhotostreamCreateFormValues, helpers: FormikHelpers<PhotostreamCreateFormValues>) => {
    if (!values.image) {
      helpers.setSubmitting(false);
      return;
    }
    const payload: PhotostreamUploadData = {
      createdAt: new Date().toISOString(), // @TODO extract the date from the image
      ...(values.locationName ? {locationName: values.locationName} : undefined),
      ...(values.eventData ? {eventID: values.eventData.eventID} : undefined),
      image: values.image,
    };

    if (values.savePhoto) {
      await saveImageQueryToLocal(ImageQueryData.fromData(values.image));
    }

    uploadMutation.mutate(
      {
        imageUploadData: payload,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['/photostream']});
          navigation.goBack();
        },
        onSettled: () => {
          helpers.setSubmitting(false);
        },
      },
    );
  };

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(MainStackComponents.photostreamHelpScreen)}
          />
        </HeaderButtons>
      </View>
    );
  }, [navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  if (!locationData) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ScrollingContentView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <PaddedContentView>
          <PhotostreamImageCreateForm
            locations={locationData.locations}
            events={locationData.events}
            onSubmit={onSubmit}
            savePhoto={appConfig.userPreferences.autosavePhotos}
          />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
