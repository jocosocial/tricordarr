import {StackScreenProps} from '@react-navigation/stack';
import {FormikHelpers} from 'formik';
import React from 'react';

import {ForumThreadEditForm} from '#src/Components/Forms/Forum/ForumThreadEditForm';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {useForumCacheReducer} from '#src/Hooks/Forum/useForumCacheReducer';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useForumRenameMutation} from '#src/Queries/Forum/ForumThreadMutationQueries';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {ForumThreadValues} from '#src/Types/FormValues';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.forumThreadEditScreen>;

export const ForumThreadEditScreen = (props: Props) => {
  return (
    <PreRegistrationScreen helpScreen={CommonStackComponents.forumThreadHelpScreen}>
      <DisabledFeatureScreen
        feature={SwiftarrFeature.forums}
        urlPath={`/forum/${props.route.params.forumData.forumID}/edit`}>
        <ForumThreadEditScreenInner {...props} />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};

const ForumThreadEditScreenInner = ({route, navigation}: Props) => {
  const editMutation = useForumRenameMutation();
  const {renameThread, renameThreadModeration} = useForumCacheReducer();
  const {data: profilePublicData} = useUserProfileQuery();

  /**
   * Submit the renamed title, then patch forum caches and (when launched from
   * the moderate screen) the forum-thread moderation cache before going back.
   * The moderation patch uses the submitted title, not public ForumData —
   * quarantined threads return "Forum Title is under moderator review".
   */
  const onSubmit = (values: ForumThreadValues, helpers: FormikHelpers<ForumThreadValues>) => {
    editMutation.mutate(
      {
        forumID: route.params.forumData.forumID,
        name: values.title,
      },
      {
        onSuccess: () => {
          renameThread(route.params.forumData.forumID, route.params.forumData.categoryID, values.title);
          if (route.params.intent === 'moderate' && profilePublicData) {
            renameThreadModeration(
              route.params.forumData.forumID,
              route.params.forumData.title,
              values.title,
              profilePublicData.header,
            );
          }
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
          <ForumThreadEditForm forumData={route.params.forumData} onSubmit={onSubmit} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
