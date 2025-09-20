import {AppView} from '#src/Views/AppView.tsx';
import React from 'react';
import {ScrollingContentView} from '#src/Views/Content/ScrollingContentView.tsx';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ImageUploadData, PostContentData} from '../../../../Libraries/Structs/ControllerStructs.tsx';
import {FormikHelpers} from 'formik';
import {ContentPostForm} from '#src/Forms/ContentPostForm.tsx';
import {replaceMentionValues} from 'react-native-controlled-mentions';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens.tsx';
import {useForumPostUpdateMutation} from '#src/Queries/Forum/ForumPostMutations.ts';
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
