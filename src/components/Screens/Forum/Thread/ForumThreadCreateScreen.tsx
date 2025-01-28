import React, {useRef, useState} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ForumStackComponents, ForumStackParamList} from '../../../Navigation/Stacks/ForumStackNavigator';
import {AppView} from '../../../Views/AppView';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView';
import {ForumCreateForm} from '../../../Forms/Forum/ForumCreateForm.tsx';
import {FormikHelpers, FormikProps} from 'formik';
import {ForumCreateData, PostContentData} from '../../../../libraries/Structs/ControllerStructs';
import {ForumThreadValues} from '../../../../libraries/Types/FormValues';
import {ContentPostForm} from '../../../Forms/ContentPostForm';
import {useForumCreateMutation} from '../../../Queries/Forum/ForumThreadMutationQueries.ts';
import {PostAsUserBanner} from '../../../Banners/PostAsUserBanner';
import {replaceMentionValues} from 'react-native-controlled-mentions';
import {CommonStackComponents} from '../../../Navigation/CommonScreens';
import {useQueryClient} from '@tanstack/react-query';

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
    postFormRef.current.values.text = replaceMentionValues(postFormRef.current.values.text, ({name}) => `@${name}`);
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
            queryClient.invalidateQueries([`/forum/${response.data.forumID}`]),
            queryClient.invalidateQueries([`/forum/categories/${response.data.categoryID}`]),
            queryClient.invalidateQueries(['/forum/search']),
            queryClient.invalidateQueries(['/forum/categories']),
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
