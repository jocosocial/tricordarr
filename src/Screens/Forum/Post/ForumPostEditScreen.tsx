import {AppView} from '#src/Components/Views/AppView';
import React from 'react';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ImageUploadData, PostContentData} from '#src/Structs/ControllerStructs';
import {FormikHelpers} from 'formik';
import {ContentPostForm} from '#src/Components/Forms/ContentPostForm';
import {replaceMentionValues} from 'react-native-controlled-mentions';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {useForumPostUpdateMutation} from '#src/Queries/Forum/ForumPostMutations';
import {useQueryClient} from '@tanstack/react-query';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.forumPostEditScreen>;

export const ForumPostEditScreen = ({route, navigation}: Props) => {
  const postUpdateMutation = useForumPostUpdateMutation();
  const queryClient = useQueryClient();

  const onSubmit = (values: PostContentData, helpers: FormikHelpers<PostContentData>) => {
    values.text = replaceMentionValues(values.text, ({name}) => `@${name}`);
    postUpdateMutation.mutate(
      {
        postID: route.params.postData.postID.toString(),
        postContentData: values,
      },
      {
        onSuccess: async () => {
          await Promise.all([
            queryClient.invalidateQueries([`/forum/post/${route.params.postData.postID}`]),
            queryClient.invalidateQueries(['/forum/post/search']),
            queryClient.invalidateQueries([`/forum/post/${route.params.postData.postID}/forum`]),
          ]);
          if (route.params.forumData) {
            await Promise.all([queryClient.invalidateQueries([`/forum/${route.params.forumData.forumID}`])]);
          }
          navigation.goBack();
        },
        onSettled: () => helpers.setSubmitting(false),
      },
    );
  };

  const initialValues: PostContentData = {
    text: route.params.postData.text,
    images:
      route.params.postData.images?.map((fileName: string): ImageUploadData => {
        return {filename: fileName};
      }) || [],
    postAsModerator: false,
    postAsTwitarrTeam: false,
  };

  return (
    <AppView>
      <ScrollingContentView isStack={false} />
      <ContentPostForm
        onSubmit={onSubmit}
        enablePhotos={true}
        maxLength={2000}
        maxPhotos={4}
        initialValues={initialValues}
      />
    </AppView>
  );
};
