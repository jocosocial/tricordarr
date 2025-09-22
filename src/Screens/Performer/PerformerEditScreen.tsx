import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useQueryClient} from '@tanstack/react-query';
import {FormikHelpers} from 'formik';
import React from 'react';

import {ShadowPerformerForm} from '#src/Components/Forms/Performer/ShadowPerformerForm';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {usePerformerUpsertMutation} from '#src/Queries/Performer/PerformerMutations';
import {EventData, PerformerData, PerformerUploadData} from '#src/Structs/ControllerStructs';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.performerEditScreen>;

export const PerformerEditScreen = ({navigation, route}: Props) => {
  const performerMutation = usePerformerUpsertMutation();
  const queryClient = useQueryClient();

  const onSubmit = (values: PerformerUploadData, helpers: FormikHelpers<PerformerUploadData>) => {
    performerMutation.mutate(
      {
        performerData: values,
        eventID: route.params.eventID,
      },
      {
        onSuccess: async () => {
          const invalidations = PerformerData.getCacheKeys(route.params.performerData.header.id)
            .map(key => {
              return queryClient.invalidateQueries({queryKey: key});
            })
            .concat(
              EventData.getCacheKeys(route.params.eventID).map(key => {
                return queryClient.invalidateQueries({queryKey: key});
              }),
            );
          await Promise.all(invalidations);
          navigation.goBack();
        },
        onSettled: () => helpers.setSubmitting(false),
      },
    );
  };

  const initialValues: PerformerUploadData = {
    ...route.params.performerData,
    name: route.params.performerData.header.name,
    photo: {
      filename: route.params.performerData.header.photo,
    },
    isOfficialPerformer: route.params.performerData.header.isOfficialPerformer,
    eventUIDs: route.params.performerData.events.map(e => e.eventID),
  };

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <PaddedContentView padTop={true}>
          <ShadowPerformerForm onSubmit={onSubmit} initialValues={initialValues} buttonText={'Save'} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
