import {StackScreenProps} from '@react-navigation/stack';
import {FormikHelpers} from 'formik';
import React from 'react';
import {View} from 'react-native';
import {replaceTriggerValues} from 'react-native-controlled-mentions';
import {KeyboardAvoidingView} from 'react-native-keyboard-controller';

import {ContentPostForm} from '#src/Components/Forms/ContentPostForm';
import {AppSnackbar} from '#src/Components/Snackbars/AppSnackbar';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useClientSettings} from '#src/Context/Contexts/ClientSettingsContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {useForumCacheReducer} from '#src/Hooks/Forum/useForumCacheReducer';
import {useKeyboardVerticalOffset} from '#src/Hooks/Keyboard/useKeyboardVerticalOffset';
import {createLogger} from '#src/Libraries/Logger';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useForumPostUpdateMutation} from '#src/Queries/Forum/ForumPostMutations';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {ImageUploadData, PostContentData} from '#src/Structs/ControllerStructs';

const logger = createLogger('ForumPostEditScreen.tsx');

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
  const {updatePost, updatePostModeration} = useForumCacheReducer();
  const {maxForumPostImages} = useClientSettings();
  const {data: profilePublicData} = useUserProfileQuery();
  const {commonStyles} = useStyles();
  const keyboardVerticalOffset = useKeyboardVerticalOffset();

  /**
   * Submit the edited post, then patch forum caches and (when launched from
   * the moderate screen) the forum-post moderation cache before going back.
   *
   * Awaits the mutation so Formik holds isSubmitting (and the submit button stays disabled)
   * for the full round trip. See #533.
   */
  const onSubmit = async (values: PostContentData, _helpers: FormikHelpers<PostContentData>) => {
    values.text = replaceTriggerValues(values.text, ({name}) => `@${name}`);
    try {
      const response = await postUpdateMutation.mutateAsync({
        postID: route.params.postData.postID.toString(),
        postContentData: values,
      });
      updatePost(route.params.postData.postID, route.params.forumID, response.data);
      if (route.params.intent === 'moderate' && profilePublicData) {
        updatePostModeration(
          route.params.postData.postID,
          route.params.postData,
          values.text,
          values.images.map(image => image.filename).filter((filename): filename is string => Boolean(filename)),
          profilePublicData.header,
        );
      }
      navigation.goBack();
    } catch (error) {
      // The error snackbar is raised by useTokenAuthMutation's onError. Swallow here so the
      // rejection doesn't escape into Formik's submit handling.
      logger.error('Forum post update failed.', error);
    }
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

  // AppView leaves the snackbar to this screen: drawn at the bottom of the content area, it sits
  // just above the composer and rides up with it when the keyboard opens instead of covering it.
  return (
    <AppView disableSnackbar={true}>
      <KeyboardAvoidingView
        style={commonStyles.flex}
        behavior={'padding'}
        keyboardVerticalOffset={keyboardVerticalOffset}>
        <View style={commonStyles.flex}>
          <ScrollingContentView isStack={false} />
          <AppSnackbar ignoreBottomInset={true} />
        </View>
        <ContentPostForm
          onSubmit={onSubmit}
          enablePhotos={true}
          enableMentions={true}
          maxLength={2000}
          maxPhotos={maxForumPostImages}
          initialValues={initialValues}
        />
      </KeyboardAvoidingView>
    </AppView>
  );
};
