import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';

import {ShadowPerformerForm} from '#src/Components/Forms/Performer/ShadowPerformerForm';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {usePerformerCacheReducer} from '#src/Hooks/Performer/usePerformerCacheReducer';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {usePerformerUpsertMutation} from '#src/Queries/Performer/PerformerMutations';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PerformerUploadData} from '#src/Structs/ControllerStructs';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.performerEditScreen>;

export const PerformerEditScreen = (props: Props) => {
  return (
    <DisabledFeatureScreen
      feature={SwiftarrFeature.performers}
      urlPath={
        props.route.params.eventID
          ? `/performer/shadow/addtoevent/${props.route.params.eventID}`
          : '/performer/shadow/self'
      }>
      <PerformerEditScreenInner {...props} />
    </DisabledFeatureScreen>
  );
};

const PerformerEditScreenInner = ({navigation, route}: Props) => {
  const performerMutation = usePerformerUpsertMutation();
  const {upsertPerformer} = usePerformerCacheReducer();

  /**
   * Awaits the mutation so Formik keeps the submit button disabled until the request settles.
   * Without an eventID the profile is saved via `/performer/self`, unattached to any event.
   */
  const onSubmit = async (values: PerformerUploadData) => {
    try {
      const response = await performerMutation.mutateAsync({
        performerData: values,
        eventID: route.params.eventID,
      });
      upsertPerformer(response.data);
      navigation.goBack();
    } catch {
      // useTokenAuthMutation surfaces the error in a snackbar.
    }
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
