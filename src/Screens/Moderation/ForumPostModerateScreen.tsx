import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {ModerationActionRow} from '#src/Components/Views/Moderation/ModerationActionRow';
import {ModerationContentPreview} from '#src/Components/Views/Moderation/ModerationContentPreview';
import {ModerationDeletedNotice} from '#src/Components/Views/Moderation/ModerationDeletedNotice';
import {ModerationPostEditList} from '#src/Components/Views/Moderation/ModerationPostEditList';
import {ModerationReportsSection} from '#src/Components/Views/Moderation/ModerationReportsSection';
import {ModerationStateActions} from '#src/Components/Views/Moderation/ModerationStateActions';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useModerationContentActions} from '#src/Hooks/useModerationContentActions';
import {useModerationHelpHeader} from '#src/Hooks/useModerationHelpHeader';
import {useRefresh} from '#src/Hooks/useRefresh';
import {alertDeleteModeratedContent} from '#src/Libraries/Alerts/ModerationAlerts';
import {postDataFromDetail} from '#src/Libraries/Moderation';
import {pushModerateResource} from '#src/Libraries/ModerationNavigation';
import {
  CommonStackComponents,
  CommonStackParamList,
  useCommonStack,
} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useForumPostDeleteMutation} from '#src/Queries/Forum/ForumPostMutations';
import {useForumPostModerationQuery} from '#src/Queries/Moderation/ModerationQueries';
import {ModeratorFeatureScreen} from '#src/Screens/Checkpoint/ModeratorFeatureScreen';
import {ForumPostModerationData} from '#src/Structs/ControllerStructs';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.forumPostModerateScreen>;

const ForumPostModerateScreenInner = ({route}: Props) => {
  const {id} = route.params;
  const navigation = useCommonStack();
  const {setSnackbarPayload} = useSnackbar();
  const {data, refetch, isLoading} = useForumPostModerationQuery(id);
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const actions = useModerationContentActions(ForumPostModerationData.getCacheKeys(id));
  const deleteMutation = useForumPostDeleteMutation();
  useModerationHelpHeader();

  if (isLoading || !data) {
    return <LoadingView refreshing={refreshing} onRefresh={onRefresh} />;
  }

  const onDelete = () => {
    alertDeleteModeratedContent('forum post', () => {
      deleteMutation.mutate(
        {postID: id},
        {
          onSuccess: async () => {
            await actions.invalidate();
            setSnackbarPayload({message: 'Forum post deleted.', messageType: 'info'});
          },
        },
      );
    });
  };

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        overScroll={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <ModerationDeletedNotice contentLabel={'forum post'} visible={data.isDeleted} />
        <PaddedContentView padTop={true}>
          <ModerationContentPreview
            author={data.forumPost.author}
            timestamp={data.forumPost.createdAt}
            text={data.forumPost.text}
            images={data.forumPost.images}
          />
        </PaddedContentView>
        <PaddedContentView>
          <ModerationActionRow
            buttons={[
              {
                label: 'Edit',
                disabled: data.isDeleted,
                onPress: () =>
                  navigation.push(CommonStackComponents.forumPostEditScreen, {
                    postData: postDataFromDetail(data.forumPost),
                  }),
              },
              {
                label: 'Delete',
                disabled: data.isDeleted || deleteMutation.isPending,
                onPress: onDelete,
              },
              {
                label: 'Mod User',
                onPress: () => pushModerateResource(navigation, 'user', data.forumPost.author.userID),
              },
              {
                label: 'View in Context',
                onPress: () =>
                  navigation.push(CommonStackComponents.forumThreadPostScreen, {
                    postID: String(data.forumPost.postID),
                  }),
              },
            ]}
          />
        </PaddedContentView>
        <PaddedContentView>
          <ModerationStateActions
            status={data.moderationStatus}
            disabled={data.isDeleted}
            isLoading={actions.isLoading}
            onSelect={state => actions.setState('forumpost', id, state)}
          />
        </PaddedContentView>
        <ModerationPostEditList edits={data.edits} />
        <ModerationReportsSection
          reports={data.reports}
          contentLabel={'forum post'}
          isLoading={actions.isLoading}
          onHandleAll={() => actions.handleAll(data.reports)}
          onCloseAll={() => actions.closeAll(data.reports)}
        />
      </ScrollingContentView>
    </AppView>
  );
};

export const ForumPostModerateScreen = (props: Props) => {
  return (
    <ModeratorFeatureScreen>
      <ForumPostModerateScreenInner {...props} />
    </ModeratorFeatureScreen>
  );
};
