import {StackScreenProps} from '@react-navigation/stack';
import {FormikHelpers} from 'formik';
import React from 'react';
import {replaceTriggerValues} from 'react-native-controlled-mentions';

import {ContentPostForm} from '#src/Components/Forms/ContentPostForm';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {useForumCacheReducer} from '#src/Hooks/Forum/useForumCacheReducer';
import {useMaxForumPostImages} from '#src/Hooks/useMaxForumPostImages';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {useForumPostUpdateMutation} from '#src/Queries/Forum/ForumPostMutations';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {ImageUploadData, PostContentData} from '#src/Structs/ControllerStructs';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.forumPostEditScreen>;

export const ForumPostEditScreen = (props: Props) => {
  return (
    <PreRegistrationScreen helpScreen={CommonStackComponents.forumThreadHelpScreen}>
      <DisabledFeatureScreen
        feature={SwiftarrFeature.forums}
        urlPath={`/forumpost/edit/${props.route.params.postData.postID}`}>
        <ForumPostEditScreenInner {...props} />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};

const ForumPostEditScreenInner = ({route, navigation}: Props) => {
  const postUpdateMutation = useForumPostUpdateMutation();
  const {updatePost} = useForumCacheReducer();
  const maxForumPostImages = useMaxForumPostImages();

  const onSubmit = (values: PostContentData, helpers: FormikHelpers<PostContentData>) => {
    values.text = replaceTriggerValues(values.text, ({name}) => `@${name}`);
    postUpdateMutation.mutate(
      {
        postID: route.params.postData.postID.toString(),
        postContentData: values,
      },
      {
        onSuccess: response => {
          updatePost(route.params.postData.postID, route.params.forumData?.forumID, response.data);
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
        maxPhotos={maxForumPostImages}
        initialValues={initialValues}
      />
    </AppView>
  );
};
