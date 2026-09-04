import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';

import {ModeratorReportFAB} from '#src/Components/Buttons/FloatingActionButtons/ModeratorReportFAB';
import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {ModeratorContentSegmentedButtons} from '#src/Components/Buttons/SegmentedButtons/ModeratorContentSegmentedButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {ForumPostListItem} from '#src/Components/Lists/Items/Forum/ForumPostListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {ListTitleView} from '#src/Components/Views/ListTitleView';
import {ModerationPostEditList} from '#src/Components/Views/Moderation/ModerationPostEditList';
import {ModerationReportListItem} from '#src/Components/Views/Moderation/ModerationReportListItem';
import {ModeratorStateView} from '#src/Components/Views/Moderation/ModeratorStateView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {ModerationDeletedWarningView} from '#src/Components/Views/Warnings/ModerationDeletedWarningView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {useForumCacheReducer} from '#src/Hooks/Forum/useForumCacheReducer';
import {useModerationContentActions} from '#src/Hooks/useModerationContentActions';
import {useModerationHelpHeader} from '#src/Hooks/useModerationHelpHeader';
import {useRefresh} from '#src/Hooks/useRefresh';
import {alertDeleteModeratedContent} from '#src/Libraries/Alerts/ModerationAlerts';
import {postDataFromDetail} from '#src/Libraries/Moderation';
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
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();
  const {data, refetch, isLoading} = useForumPostModerationQuery(id);
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const actions = useModerationContentActions(ForumPostModerationData.getCacheKeys(id));
  const deleteMutation = useForumPostDeleteMutation();
  const {deletePost} = useForumCacheReducer();
  useModerationHelpHeader();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        post: {
          ...commonStyles.paddingHorizontalSmall,
          ...commonStyles.paddingTopSmall,
          ...commonStyles.paddingBottomSmall,
        },
        editDelete: {
          ...commonStyles.paddingHorizontalSmall,
          ...commonStyles.paddingBottomSmall,
        },
      }),
    [commonStyles],
  );

  if (isLoading || !data) {
    return <LoadingView refreshing={refreshing} onRefresh={onRefresh} />;
  }

  const onDelete = () => {
    alertDeleteModeratedContent('forum post', () => {
      deleteMutation.mutate(
        {postID: id},
        {
          onSuccess: async () => {
            deletePost(data.forumPost.postID, data.forumPost.forumID, undefined);
            await actions.invalidate();
            setSnackbarPayload({message: 'Forum post deleted.', messageType: 'info'});
          },
        },
      );
    });
  };

  const postData = postDataFromDetail(data.forumPost);

  /**
   * Pass forumID so the thread screen uses /forum/{forumID}?startPost=
   * instead of /forum/post/{id}/forum, which 404s on deleted posts.
   */
  const onViewInContext = () => {
    navigation.push(CommonStackComponents.forumThreadPostScreen, {
      postID: String(data.forumPost.postID),
      forumID: data.forumPost.forumID,
    });
  };

  return (
    <AppView>
      <ModerationDeletedWarningView contentLabel={'forum post'} visible={data.isDeleted} />
      <ScrollingContentView
        isStack={true}
        overScroll={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <ListTitleView title={'Content'} />
        <View style={styles.post}>
          <ForumPostListItem postData={postData} enableShowInThread={!data.isDeleted} />
        </View>
        <PaddedContentView>
          <PrimaryActionButton
            testID={'forumPostModerateView-button'}
            buttonText={'View in Context'}
            buttonColor={theme.colors.twitarrNeutralButton}
            onPress={onViewInContext}
          />
        </PaddedContentView>
        <PaddedContentView>
          <ModeratorStateView data={data} />
        </PaddedContentView>
        {!data.isDeleted && (
          <View style={styles.editDelete}>
            <ModeratorContentSegmentedButtons
              onEdit={() =>
                navigation.push(CommonStackComponents.forumPostEditScreen, {
                  postData,
                  forumID: data.forumPost.forumID,
                  intent: 'moderate',
                })
              }
              onDelete={onDelete}
              isDeleting={deleteMutation.isPending}
            />
          </View>
        )}
        <ModerationPostEditList edits={data.edits} />
        <ListSection>
          <ListSubheader>Reports</ListSubheader>
        </ListSection>
        {data.reports.length === 0 ? (
          <PaddedContentView padTop={true}>
            <Text>No reports on this forum post.</Text>
          </PaddedContentView>
        ) : (
          data.reports.map(report => <ModerationReportListItem key={report.id} report={report} />)
        )}
      </ScrollingContentView>
      <ModeratorReportFAB
        data={data}
        onHandleAll={() => actions.handleAll(data.reports)}
        onCloseAll={() => actions.closeAll(data.reports)}
      />
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
