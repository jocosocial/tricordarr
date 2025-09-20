import React, {useCallback, useRef, useState} from 'react';
import {AppView} from '#src/Views/AppView.tsx';
import {FezContentData, FezData, PostContentData} from '../../../Libraries/Structs/ControllerStructs.tsx';
import {ScrollingContentView} from '#src/Views/Content/ScrollingContentView.tsx';
import {ContentPostForm} from '#src/Forms/ContentPostForm.tsx';
import {SeamailCreateForm} from '#src/Forms/SeamailCreateForm.tsx';
import {FormikProps} from 'formik';
import {useFezPostMutation} from '#src/Queries/Fez/FezPostMutations.ts';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {FezType} from '../../../Libraries/Enums/FezType.ts';
import {PostAsUserBanner} from '#src/Banners/PostAsUserBanner.tsx';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens.tsx';
import {SeamailFormValues} from '../../../Libraries/Types/FormValues.ts';
import {useFezCreateMutation} from '#src/Queries/Fez/FezMutations.ts';
import {useQueryClient} from '@tanstack/react-query';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.seamailCreateScreen>;

// Chips: https://github.com/callstack/react-native-paper/issues/801
export const SeamailCreateScreen = ({navigation, route}: Props) => {
  const seamailCreateFormRef = useRef<FormikProps<SeamailFormValues>>(null);
  const seamailPostFormRef = useRef<FormikProps<PostContentData>>(null);
  const fezMutation = useFezCreateMutation();
  const fezPostMutation = useFezPostMutation();
  const [newSeamail, setNewSeamail] = useState<FezData>();
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

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
      setSubmitting(true);
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
              return queryClient.invalidateQueries(key);
            });
            await Promise.all(invalidations);
            // Whatever we picked in the SeamailCreate is what should be set in the Post.
            seamailPostFormRef.current?.setFieldValue('postAsModerator', values.createdByModerator);
            seamailPostFormRef.current?.setFieldValue('postAsTwitarrTeam', values.createdByTwitarrTeam);
            seamailPostFormRef.current?.submitForm();
          },
          onSettled: () => {
            setSubmitting(false);
            seamailCreateFormRef.current?.setSubmitting(false);
          },
        },
      );
    },
    [queryClient, fezMutation],
  );

  // Handler for pushing the FezPost submit button.
  const onPostSubmit = useCallback(
    (values: PostContentData) => {
      if (newSeamail) {
        fezPostMutation.mutate(
          {fezID: newSeamail.fezID, postContentData: values},
          {
            onSuccess: () => {
              setSubmitting(false);
              navigation.replace(CommonStackComponents.seamailChatScreen, {
                fezID: newSeamail.fezID,
              });
            },
          },
        );
      } else {
        console.error('Seamail is empty?');
        setSubmitting(false);
      }
    },
    [fezPostMutation, navigation, newSeamail],
  );

  // Handler to trigger the chain of events needed to complete this screen.
  const onSubmit = useCallback(() => {
    setSubmitting(true);
    seamailCreateFormRef.current?.submitForm();
  }, []);

  return (
    <AppView>
      <PostAsUserBanner />
      <ScrollingContentView>
        <SeamailCreateForm formRef={seamailCreateFormRef} onSubmit={onFezSubmit} initialValues={initialFormValues} />
      </ScrollingContentView>
      <ContentPostForm
        formRef={seamailPostFormRef}
        overrideSubmitting={submitting}
        onPress={onSubmit}
        onSubmit={onPostSubmit}
        enablePhotos={false}
      />
    </AppView>
  );
};
