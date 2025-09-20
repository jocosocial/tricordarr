import React, {useCallback, useEffect, useState} from 'react';
import {AppView} from '#src/Views/AppView.tsx';
import {usePhotostreamLocationDataQuery} from '#src/Queries/Photostream/PhotostreamQueries.ts';
import {ScrollingContentView} from '#src/Views/Content/ScrollingContentView.tsx';
import {RefreshControl, View} from 'react-native';
import {PhotostreamImageCreateForm} from '#src/Forms/Photostream/PhotostreamImageCreateForm.tsx';
import {PhotostreamCreateFormValues} from '../../../Libraries/Types/FormValues.ts';
import {FormikHelpers} from 'formik';
import {LoadingView} from '#src/Views/Static/LoadingView.tsx';
import {PhotostreamUploadData} from '../../../Libraries/Structs/ControllerStructs.tsx';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MainStackComponents, MainStackParamList} from '#src/Navigation/Stacks/MainStackNavigator.tsx';
import {useQueryClient} from '@tanstack/react-query';
import {PaddedContentView} from '#src/Views/Content/PaddedContentView.tsx';
import {usePhotostreamImageUploadMutation} from '#src/Queries/Photostream/PhotostreamMutations.ts';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '#src/Buttons/MaterialHeaderButton.tsx';
import {PhotostreamActionsMenu} from '#src/Menus/Photostream/PhotostreamActionsMenu.tsx';
import {AppIcons} from '../../../Libraries/Enums/Icons.ts';

export type Props = NativeStackScreenProps<MainStackParamList, MainStackComponents.photostreamImageCreateScreen>;

export const PhotostreamImageCreateScreen = ({navigation}: Props) => {
  const {data: locationData, refetch: refetchLocationData} = usePhotostreamLocationDataQuery();
  const [refreshing, setRefreshing] = useState(false);
  const uploadMutation = usePhotostreamImageUploadMutation();
  const queryClient = useQueryClient();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchLocationData();
    setRefreshing(false);
  };

  const onSubmit = (values: PhotostreamCreateFormValues, helpers: FormikHelpers<PhotostreamCreateFormValues>) => {
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
    uploadMutation.mutate(
      {
        imageUploadData: payload,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(['/photostream']);
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
          />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
