import {StackScreenProps} from '@react-navigation/stack';
import {useQueryClient} from '@tanstack/react-query';
import {FormikHelpers, FormikProps} from 'formik';
import React, {useRef, useState} from 'react';
import {replaceTriggerValues} from 'react-native-controlled-mentions';

import {PostAsUserBanner} from '#src/Components/Banners/PostAsUserBanner';
import {ContentPostForm} from '#src/Components/Forms/ContentPostForm';
import {ForumCreateForm} from '#src/Components/Forms/Forum/ForumCreateForm';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {ForumStackComponents, ForumStackParamList} from '#src/Navigation/Stacks/ForumStackNavigator';
import {useForumCreateMutation} from '#src/Queries/Forum/ForumThreadMutationQueries';
import {ForumCreateData, ForumData, ForumListData, PostContentData} from '#src/Structs/ControllerStructs';
import {ForumThreadValues} from '#src/Types/FormValues';

type Props = StackScreenProps<ForumStackParamList, ForumStackComponents.forumThreadCreateScreen>;

export const ForumThreadCreateScreen = ({route, navigation}: Props) => {
  const forumFormRef = useRef<FormikProps<ForumThreadValues>>(null);
  const postFormRef = useRef<FormikProps<PostContentData>>(null);
  const [submitting, setSubmitting] = useState(false);
  const [forumFormValid, setForumFormValid] = useState(false);
  const forumCreateMutation = useForumCreateMutation();
  const queryClient = useQueryClient();
  // Use a ref to store the created forum data immediately (synchronously) to avoid race condition
  const createdForumRef = useRef<ForumData | null>(null);

  const onForumSubmit = (values: ForumThreadValues, formikHelpers: FormikHelpers<ForumThreadValues>) => {
    setSubmitting(true);
    if (!postFormRef.current) {
      console.error('Post form ref undefined.');
      setSubmitting(false);
      return;
    }
    // Whatever we picked in the Forum is what should be set in the Post.
    // Forum doesn't take these params and keys off of the first post.
    postFormRef.current.setFieldValue('postAsModerator', values.postAsModerator);
    postFormRef.current.setFieldValue('postAsTwitarrTeam', values.postAsTwitarrTeam);
    postFormRef.current.values.text = replaceTriggerValues(postFormRef.current.values.text, ({name}) => `@${name}`);
    const forumData: ForumCreateData = {
      title: values.title,
      firstPost: postFormRef.current.values,
    };
    forumCreateMutation.mutate(
      {
        forumCreateData: forumData,
        categoryId: route.params.categoryId,
      },
      {
        onSuccess: response => {
          // Store in ref immediately (synchronously) to avoid race condition
          createdForumRef.current = response.data;
          // Use ref instead of response.data to avoid race condition - ref is set synchronously
          const createdForum = createdForumRef.current;
          if (createdForum) {
            navigation.replace(CommonStackComponents.forumThreadScreen, {
              forumID: createdForum.forumID,
            });
          }
        },
        onSettled: () => formikHelpers.setSubmitting(false),
      },
    );
  };

  const onPostSubmit = async (values: PostContentData, formikBag: FormikHelpers<PostContentData>) => {
    // Invalidations moved here from onForumSubmit to match pattern from SeamailCreateScreen
    const createdForum = createdForumRef.current;
    if (createdForum) {
      const invalidations = ForumListData.getCacheKeys(createdForum.categoryID, createdForum.forumID).map(key => {
        return queryClient.invalidateQueries({queryKey: key});
      });
      await Promise.all(invalidations);
    }
    formikBag.setSubmitting(false);
  };

  // Handler to trigger the chain of events needed to complete this screen.
  const onSubmit = () => {
    setSubmitting(true);
    forumFormRef.current?.submitForm();
  };

  return (
    <AppView>
      <PostAsUserBanner />
      <ScrollingContentView>
        <ForumCreateForm onSubmit={onForumSubmit} formRef={forumFormRef} onValidationChange={setForumFormValid} />
      </ScrollingContentView>
      <ContentPostForm
        onSubmit={onPostSubmit}
        formRef={postFormRef}
        overrideSubmitting={submitting}
        onPress={onSubmit}
        enablePhotos={true}
        maxLength={2000}
        maxPhotos={4}
        disabled={!forumFormValid}
      />
    </AppView>
  );
};
