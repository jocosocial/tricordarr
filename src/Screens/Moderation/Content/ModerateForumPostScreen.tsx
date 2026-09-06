import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';

import {ModeratorReportFAB} from '#src/Components/Buttons/FloatingActionButtons/ModeratorReportFAB';
import {useModerationHeaderButtons} from '#src/Components/Buttons/HeaderButtons/ModerationHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {ForumPostListItem} from '#src/Components/Lists/Items/Forum/ForumPostListItem';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {ModerationContentHistorySectionView} from '#src/Components/Views/Moderation/Content/ModerationContentHistorySectionView';
import {ModerationContentReportsSectionView} from '#src/Components/Views/Moderation/Content/ModerationContentReportsSectionView';
import {ModerationContentSectionView} from '#src/Components/Views/Moderation/Content/ModerationContentSectionView';
import {ModerationContentVisibilitySectionView} from '#src/Components/Views/Moderation/Content/ModerationContentVisibilitySectionView';
import {ModerationEditListItem} from '#src/Components/Lists/Items/Moderation/ModerationEditListItem';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {ModerationDeletedWarningView} from '#src/Components/Views/Warnings/ModerationDeletedWarningView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {useForumCacheReducer} from '#src/Hooks/Forum/useForumCacheReducer';
import {useModerationContentActions} from '#src/Hooks/Moderation/useModerationContentActions';
import {useRefresh} from '#src/Hooks/useRefresh';
import {alertDeleteModeratedContent} from '#src/Libraries/Alerts/ModerationAlerts';
import {postDataFromDetail} from '#src/Libraries/Moderation/Content';
import {ShareContentType} from '#src/Libraries/Sharing';
import {
  CommonStackComponents,
  CommonStackParamList,
  useCommonStack,
} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useForumPostDeleteMutation} from '#src/Queries/Forum/ForumPostMutations';
import {useForumPostModerationQuery} from '#src/Queries/Moderation/ModerationQueries';
import {ModeratorFeatureScreen} from '#src/Screens/Checkpoint/ModeratorFeatureScreen';
import {ForumPostModerationData, PostEditLogData} from '#src/Structs/ControllerStructs';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.moderateForumPostScreen>;

const ModerateForumPostScreenInner = ({route}: Props) => {
  const {id} = route.params;
  const navigation = useCommonStack();
  const {setSnackbarPayload} = useSnackbar();
  const {commonStyles} = useStyles();
  const {data, refetch, isLoading} = useForumPostModerationQuery(id);
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const actions = useModerationContentActions(ForumPostModerationData.getCacheKeys(id));
  const deleteMutation = useForumPostDeleteMutation();
  const {deletePost} = useForumCacheReducer();
  const getNavButtons = useModerationHeaderButtons({
    contentType: ShareContentType.forumPost,
    contentID: id,
    contentIcon: AppIcons.forum,
    moderateType: ShareContentType.forumPostModerate,
    moderateID: id,
  });

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        post: {
          ...commonStyles.paddingHorizontalSmall,
          ...commonStyles.paddingTopSmall,
          ...commonStyles.paddingBottomSmall,
        },
      }),
    [commonStyles],
  );

  /**
   * Renders one previous forum-post edit as a compact content row.
   */
  const renderEdit = useCallback((edit: PostEditLogData) => {
    return (
      <ModerationEditListItem author={edit.author} timestamp={edit.createdAt} text={edit.text} images={edit.images} />
    );
  }, []);

  if (isLoading || !data) {
    return <LoadingView refreshing={refreshing} onRefresh={onRefresh} />;
  }

  const postData = postDataFromDetail(data.forumPost);

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

  const onEdit = () => {
    navigation.push(CommonStackComponents.forumPostEditScreen, {
      postData,
      forumID: data.forumPost.forumID,
      intent: 'moderate',
    });
  };

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
        <ModerationContentSectionView testIDPrefix={'forumPostModerate'} onViewInContext={onViewInContext}>
          <View style={styles.post}>
            <ForumPostListItem postData={postData} enableShowInThread={!data.isDeleted} />
          </View>
        </ModerationContentSectionView>
        <ModerationContentVisibilitySectionView
          data={data}
          testIDPrefix={'forumPostModerate'}
          onEdit={onEdit}
          onDelete={onDelete}
          isDeleting={deleteMutation.isPending}
        />
        <ModerationContentHistorySectionView edits={data.edits} renderEdit={renderEdit} />
        <ModerationContentReportsSectionView reports={data.reports} />
      </ScrollingContentView>
      <ModeratorReportFAB
        reports={data.reports}
        moderateUserID={data.forumPost.author.userID}
        testIDPrefix={'forumPostModerate'}
        onHandleAll={() => actions.handleAll(data.reports)}
        onCloseAll={() => actions.closeAll(data.reports)}
      />
    </AppView>
  );
};

export const ModerateForumPostScreen = (props: Props) => {
  return (
    <ModeratorFeatureScreen>
      <ModerateForumPostScreenInner {...props} />
    </ModeratorFeatureScreen>
  );
};
