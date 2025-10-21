import {NativeStackScreenProps} from '@react-navigation/native-stack';
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
import {ForumCreateData, PostContentData} from '#src/Structs/ControllerStructs';
import {ForumThreadValues} from '#src/Types/FormValues';

type Props = NativeStackScreenProps<ForumStackParamList, ForumStackComponents.forumThreadCreateScreen>;

export const ForumThreadCreateScreen = ({route, navigation}: Props) => {
  const forumFormRef = useRef<FormikProps<ForumThreadValues>>(null);
  const postFormRef = useRef<FormikProps<PostContentData>>(null);
  const [submitting, setSubmitting] = useState(false);
  const forumCreateMutation = useForumCreateMutation();
  const queryClient = useQueryClient();

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
        onSuccess: async response => {
          await Promise.all([
            queryClient.invalidateQueries({queryKey: [`/forum/${response.data.forumID}`]}),
            queryClient.invalidateQueries({queryKey: [`/forum/categories/${response.data.categoryID}`]}),
            queryClient.invalidateQueries({queryKey: ['/forum/search']}),
            queryClient.invalidateQueries({queryKey: ['/forum/categories']}),
          ]);
          navigation.replace(CommonStackComponents.forumThreadScreen, {
            forumID: response.data.forumID,
          });
        },
        onSettled: () => formikHelpers.setSubmitting(false),
      },
    );
  };

  const onPostSubmit = () => null;

  // Handler to trigger the chain of events needed to complete this screen.
  const onSubmit = () => {
    setSubmitting(true);
    forumFormRef.current?.submitForm();
  };

  return (
    <AppView>
      <PostAsUserBanner />
      <ScrollingContentView>
        <ForumCreateForm onSubmit={onForumSubmit} formRef={forumFormRef} />
      </ScrollingContentView>
      <ContentPostForm
        onSubmit={onPostSubmit}
        formRef={postFormRef}
        overrideSubmitting={submitting}
        onPress={onSubmit}
        enablePhotos={true}
        maxLength={2000}
        maxPhotos={4}
      />
    </AppView>
  );
};
