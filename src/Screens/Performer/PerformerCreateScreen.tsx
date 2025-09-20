import React from 'react';
import {AppView} from '#src/Components/Views/AppView';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MainStackParamList} from '#src/Navigation/Stacks/MainStackNavigator';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {ShadowPerformerForm} from '#src/Components/Forms/Performer/ShadowPerformerForm';
import {EventData, PerformerData, PerformerUploadData} from '#src/Structs/ControllerStructs';
import {FormikHelpers} from 'formik';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {usePerformerUpsertMutation} from '#src/Queries/Performer/PerformerMutations';
import {useQueryClient} from '@tanstack/react-query';

type Props = NativeStackScreenProps<MainStackParamList, CommonStackComponents.performerCreateScreen>;

export const PerformerCreateScreen = ({route, navigation}: Props) => {
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
          const invalidations = EventData.getCacheKeys(route.params.eventID)
            .concat(PerformerData.getCacheKeys())
            .map(key => {
              return queryClient.invalidateQueries(key);
            });
          await Promise.all(invalidations);
          navigation.goBack();
        },
        onSettled: () => helpers.setSubmitting(false),
      },
    );
  };

  const initialValues: PerformerUploadData = {
    name: '',
    isOfficialPerformer: false,
    yearsAttended: [],
    eventUIDs: [],
    photo: {},
  };

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <ShadowPerformerForm onSubmit={onSubmit} buttonText={'Create'} initialValues={initialValues} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
