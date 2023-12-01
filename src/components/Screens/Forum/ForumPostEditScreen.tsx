import {AppView} from '../../Views/AppView';
import React from 'react';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ForumStackParamList} from '../../Navigation/Stacks/ForumStackNavigator';
import {ForumStackComponents, NavigatorIDs} from '../../../libraries/Enums/Navigation';
import {ForumPostEditForm} from '../../Forms/ForumPostEditForm';
import {PostContentData} from '../../../libraries/Structs/ControllerStructs';
import {FormikHelpers} from 'formik';
import {useForumPostUpdateMutation} from '../../Queries/Forum/ForumPostQueries';
import {useTwitarr} from '../../Context/Contexts/TwitarrContext';
import {ForumPostListActions} from '../../Reducers/Forum/ForumPostListReducer';

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
  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <ForumPostEditForm postData={route.params.postData} onSubmit={onSubmit} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
