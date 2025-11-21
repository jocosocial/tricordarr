import {StackScreenProps} from '@react-navigation/stack';
import {useQueryClient} from '@tanstack/react-query';
import {FormikProps} from 'formik';
import React, {useCallback, useRef, useState} from 'react';

import {PostAsUserBanner} from '#src/Components/Banners/PostAsUserBanner';
import {ContentPostForm} from '#src/Components/Forms/ContentPostForm';
import {SeamailCreateForm} from '#src/Components/Forms/SeamailCreateForm';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {FezType} from '#src/Enums/FezType';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {useFezCreateMutation} from '#src/Queries/Fez/FezMutations';
import {useFezPostMutation} from '#src/Queries/Fez/FezPostMutations';
import {DisabledFeatureScreen} from '#src/Screens/DisabledFeatureScreen';
import {FezContentData, FezData, PostContentData} from '#src/Structs/ControllerStructs';
import {SeamailFormValues} from '#src/Types/FormValues';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.seamailCreateScreen>;

export const SeamailCreateScreen = (props: Props) => {
  return (
    <DisabledFeatureScreen feature={SwiftarrFeature.seamail} urlPath={'/seamail/create'}>
      <SeamailCreateScreenInner {...props} />
    </DisabledFeatureScreen>
  );
};

// Chips: https://github.com/callstack/react-native-paper/issues/801
const SeamailCreateScreenInner = ({navigation, route}: Props) => {
  const seamailCreateFormRef = useRef<FormikProps<SeamailFormValues>>(null);
  const seamailPostFormRef = useRef<FormikProps<PostContentData>>(null);
  const fezMutation = useFezCreateMutation();
  const fezPostMutation = useFezPostMutation();
  const [seamailFormValid, setSeamailFormValid] = useState(false);
  const queryClient = useQueryClient();
  // Use a ref to store the created fez data immediately (synchronously) to avoid race condition
  const createdFezRef = useRef<FezData | null>(null);

  // Helper to reset submitting state on both forms
  const resetSubmitting = useCallback(() => {
    seamailPostFormRef.current?.setSubmitting(false);
    seamailCreateFormRef.current?.setSubmitting(false);
  }, []);

  const initialFormValues: SeamailFormValues = {
    fezType: FezType.open,
    info: '',
    initialUsers: route.params?.initialUserHeaders || [],
    maxCapacity: 0,
    minCapacity: 0,
    title: '',
    createdByTwitarrTeam: route.params?.initialAsTwitarrTeam || false,
    createdByModerator: route.params?.initialAsModerator || false,
  };

  // Handler for creating the Fez.
  const onFezSubmit = useCallback(
    (values: SeamailFormValues) => {
      const contentData: FezContentData = {
        ...values,
        initialUsers: values.initialUsers.map(u => u.userID),
      };
      fezMutation.mutate(
        {fezContentData: contentData},
        {
          onSuccess: response => {
            // Store in ref immediately (synchronously) to avoid race condition with submitForm
            createdFezRef.current = response.data;
            // Whatever we picked in the SeamailCreate is what should be set in the Post.
            seamailPostFormRef.current?.setFieldValue('postAsModerator', values.createdByModerator);
            seamailPostFormRef.current?.setFieldValue('postAsTwitarrTeam', values.createdByTwitarrTeam);
            seamailPostFormRef.current?.submitForm();
          },
          onSettled: () => {
            resetSubmitting();
          },
        },
      );
    },
    [fezMutation, resetSubmitting],
  );

  // Handler for pushing the FezPost submit button.
  const onPostSubmit = useCallback(
    (values: PostContentData) => {
      // Use ref instead of state to avoid race condition - ref is set synchronously
      const fezData = createdFezRef.current;
      if (fezData) {
        fezPostMutation.mutate(
          {fezID: fezData.fezID, postContentData: values},
          {
            onSuccess: async () => {
              const invalidations = FezData.getCacheKeys().map(key => {
                return queryClient.invalidateQueries({queryKey: key});
              });
              await Promise.all(invalidations);
              resetSubmitting();
              navigation.replace(CommonStackComponents.seamailChatScreen, {
                fezID: fezData.fezID,
              });
            },
            onError: () => {
              resetSubmitting();
            },
          },
        );
      } else {
        console.error('Seamail is empty?');
        resetSubmitting();
      }
    },
    [fezPostMutation, navigation, resetSubmitting, queryClient],
  );

  // Handler to trigger the chain of events needed to complete this screen.
  const onSubmit = useCallback(() => {
    seamailCreateFormRef.current?.submitForm();
  }, []);

  return (
    <AppView>
      <PostAsUserBanner />
      <ScrollingContentView>
        <SeamailCreateForm
          formRef={seamailCreateFormRef}
          onSubmit={onFezSubmit}
          initialValues={initialFormValues}
          onValidationChange={setSeamailFormValid}
        />
      </ScrollingContentView>
      <ContentPostForm
        formRef={seamailPostFormRef}
        overrideSubmitting={fezMutation.isPending || fezPostMutation.isPending}
        onPress={onSubmit}
        onSubmit={onPostSubmit}
        enablePhotos={false}
        disabled={!seamailFormValid}
      />
    </AppView>
  );
};
