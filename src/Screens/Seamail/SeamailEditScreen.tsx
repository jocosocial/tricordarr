import {StackScreenProps} from '@react-navigation/stack';
import {useQueryClient} from '@tanstack/react-query';
import {FormikHelpers} from 'formik';
import React from 'react';

import {SeamailEditForm} from '#src/Components/Forms/SeamailEditForm';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {useFez} from '#src/Hooks/useFez';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {useFezUpdateMutation} from '#src/Queries/Fez/FezMutations';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {FezData} from '#src/Structs/ControllerStructs';
import {ForumThreadValues} from '#src/Types/FormValues';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.seamailEditScreen>;

export const SeamailEditScreen = (props: Props) => {
  return (
    <PreRegistrationScreen>
      <DisabledFeatureScreen feature={SwiftarrFeature.seamail} urlPath={`/seamail/${props.route.params.fezID}/edit`}>
        <SeamailEditScreenInner {...props} />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};

const SeamailEditScreenInner = ({route, navigation}: Props) => {
  const {fezData, isLoading} = useFez({fezID: route.params.fezID});
  const updateMutation = useFezUpdateMutation();
  const queryClient = useQueryClient();

  const onSubmit = (values: ForumThreadValues, helpers: FormikHelpers<ForumThreadValues>) => {
    if (!fezData) {
      return;
    }

    updateMutation.mutate(
      {
        fezID: route.params.fezID,
        fezContentData: {
          fezType: fezData.fezType,
          title: values.title,
          info: '',
          minCapacity: 0,
          maxCapacity: 0,
          initialUsers: [],
        },
      },
      {
        onSuccess: async () => {
          const invalidations = FezData.getCacheKeys(route.params.fezID).map(key => {
            return queryClient.invalidateQueries({queryKey: key});
          });
          await Promise.all(invalidations);
          navigation.goBack();
        },
        onSettled: () => helpers.setSubmitting(false),
      },
    );
  };

  if (isLoading || !fezData) {
    return (
      <AppView>
        <LoadingView />
      </AppView>
    );
  }

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <PaddedContentView padTop={true}>
          <SeamailEditForm fez={fezData} onSubmit={onSubmit} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
