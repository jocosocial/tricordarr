import {StackScreenProps} from '@react-navigation/stack';
import {useQueryClient} from '@tanstack/react-query';
import {FormikHelpers} from 'formik';
import React from 'react';

import {ShadowPerformerForm} from '#src/Components/Forms/Performer/ShadowPerformerForm';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {MainStackParamList} from '#src/Navigation/Stacks/MainStackNavigator';
import {usePerformerUpsertMutation} from '#src/Queries/Performer/PerformerMutations';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {EventData, PerformerData, PerformerUploadData} from '#src/Structs/ControllerStructs';

type Props = StackScreenProps<MainStackParamList, CommonStackComponents.performerCreateScreen>;

export const PerformerCreateScreen = (props: Props) => {
  return (
    <PreRegistrationScreen helpScreen={CommonStackComponents.performerHelpScreen}>
      <DisabledFeatureScreen
        feature={SwiftarrFeature.performers}
        urlPath={`/performer/shadow/addtoevent/${props.route.params.eventID}`}>
        <PerformerCreateScreenInner {...props} />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};

const PerformerCreateScreenInner = ({route, navigation}: Props) => {
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
              return queryClient.invalidateQueries({queryKey: key});
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
