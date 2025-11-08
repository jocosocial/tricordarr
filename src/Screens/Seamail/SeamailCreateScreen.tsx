import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useQueryClient} from '@tanstack/react-query';
import {FormikProps} from 'formik';
import React, {useCallback, useRef, useState} from 'react';

import {PostAsUserBanner} from '#src/Components/Banners/PostAsUserBanner';
import {ContentPostForm} from '#src/Components/Forms/ContentPostForm';
import {SeamailCreateForm} from '#src/Components/Forms/SeamailCreateForm';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {FezType} from '#src/Enums/FezType';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {useFezCreateMutation} from '#src/Queries/Fez/FezMutations';
import {useFezPostMutation} from '#src/Queries/Fez/FezPostMutations';
import {FezContentData, FezData, PostContentData} from '#src/Structs/ControllerStructs';
import {SeamailFormValues} from '#src/Types/FormValues';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.seamailCreateScreen>;

// Chips: https://github.com/callstack/react-native-paper/issues/801
export const SeamailCreateScreen = ({navigation, route}: Props) => {
  const seamailCreateFormRef = useRef<FormikProps<SeamailFormValues>>(null);
  const seamailPostFormRef = useRef<FormikProps<PostContentData>>(null);
  const fezMutation = useFezCreateMutation();
  const fezPostMutation = useFezPostMutation();
  const [newSeamail, setNewSeamail] = useState<FezData>();
  const [seamailFormValid, setSeamailFormValid] = useState(false);
  const queryClient = useQueryClient();

  // Helper to reset submitting state on both forms
  const resetSubmitting = useCallback(() => {
    seamailPostFormRef.current?.setSubmitting(false);
    seamailCreateFormRef.current?.setSubmitting(false);
  }, []);

  const initialFormValues: SeamailFormValues = {
    fezType: FezType.open,
    info: '',
    initialUsers: route.params?.initialUserHeader ? [route.params.initialUserHeader] : [],
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
          onSuccess: async response => {
            setNewSeamail(response.data);
            const invalidations = FezData.getCacheKeys().map(key => {
              return queryClient.invalidateQueries({queryKey: key});
            });
            await Promise.all(invalidations);
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
    [queryClient, fezMutation, resetSubmitting],
  );

  // Handler for pushing the FezPost submit button.
  // @TODO this has an issue where the cache invalidations occur in the other onSubmit
  // handler. Putting them in here messed things up a lot.
  const onPostSubmit = useCallback(
    (values: PostContentData) => {
      if (newSeamail) {
        fezPostMutation.mutate(
          {fezID: newSeamail.fezID, postContentData: values},
          {
            onSuccess: () => {
              resetSubmitting();
              navigation.replace(CommonStackComponents.seamailChatScreen, {
                fezID: newSeamail.fezID,
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
    [fezPostMutation, navigation, newSeamail, resetSubmitting],
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
