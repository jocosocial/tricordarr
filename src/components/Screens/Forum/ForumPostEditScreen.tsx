import {AppView} from '../../Views/AppView';
import React from 'react';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ForumStackParamList} from '../../Navigation/Stacks/ForumStackNavigator';
import {ForumStackComponents, NavigatorIDs} from '../../../libraries/Enums/Navigation';
import {ImageUploadData, PostContentData} from '../../../libraries/Structs/ControllerStructs';
import {FormikHelpers} from 'formik';
import {useForumPostUpdateMutation} from '../../Queries/Forum/ForumPostQueries';
import {useTwitarr} from '../../Context/Contexts/TwitarrContext';
import {ForumPostListActions} from '../../Reducers/Forum/ForumPostListReducer';
import {ContentPostForm} from '../../Forms/ContentPostForm';
import {View} from 'react-native';

export type Props = NativeStackScreenProps<
  ForumStackParamList,
  ForumStackComponents.forumPostEditScreen,
  NavigatorIDs.forumStack
>;

export const ForumPostEditScreen = ({route, navigation}: Props) => {
  const postUpdateMutation = useForumPostUpdateMutation();
  const {dispatchForumPosts} = useTwitarr();

  const onSubmit = (values: PostContentData, helpers: FormikHelpers<PostContentData>) => {
    postUpdateMutation.mutate(
      {
        postID: route.params.postData.postID.toString(),
        postContentData: values,
      },
      {
        onSuccess: response => {
          dispatchForumPosts({
            type: ForumPostListActions.updatePost,
            newPost: response.data,
          });
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
