import {StackScreenProps} from '@react-navigation/stack';
import {FormikHelpers} from 'formik';
import React from 'react';

import {ShadowPerformerForm} from '#src/Components/Forms/Performer/ShadowPerformerForm';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {usePerformerCacheReducer} from '#src/Hooks/Performer/usePerformerCacheReducer';
import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {MainStackParamList} from '#src/Navigation/Stacks/Main/MainStackComponents';
import {usePerformerUpsertMutation} from '#src/Queries/Performer/PerformerMutations';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PerformerUploadData} from '#src/Structs/ControllerStructs';

type Props = StackScreenProps<MainStackParamList, CommonStackComponents.performerCreateScreen>;

export const PerformerCreateScreen = (props: Props) => {
  return (
    <DisabledFeatureScreen
      feature={SwiftarrFeature.performers}
      urlPath={`/performer/shadow/addtoevent/${props.route.params.eventID}`}>
      <PerformerCreateScreenInner {...props} />
    </DisabledFeatureScreen>
  );
};

const PerformerCreateScreenInner = ({route, navigation}: Props) => {
  const performerMutation = usePerformerUpsertMutation();
  const {upsertPerformer} = usePerformerCacheReducer();

  const onSubmit = (values: PerformerUploadData, helpers: FormikHelpers<PerformerUploadData>) => {
    performerMutation.mutate(
      {
        performerData: values,
        eventID: route.params.eventID,
      },
      {
        onSuccess: response => {
          upsertPerformer(response.data);
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
