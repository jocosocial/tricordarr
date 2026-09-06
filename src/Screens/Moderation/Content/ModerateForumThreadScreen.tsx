import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useEffect} from 'react';

import {ModeratorReportFAB} from '#src/Components/Buttons/FloatingActionButtons/ModeratorReportFAB';
import {useModerationHeaderButtons} from '#src/Components/Buttons/HeaderButtons/ModerationHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {ModerateForumThreadListItem} from '#src/Components/Lists/Items/Moderation/ModerateForumThreadListItem';
import {ModerationEditListItem} from '#src/Components/Lists/Items/Moderation/ModerationEditListItem';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {ModerationContentHistorySectionView} from '#src/Components/Views/Moderation/Content/ModerationContentHistorySectionView';
import {ModerationContentReportsSectionView} from '#src/Components/Views/Moderation/Content/ModerationContentReportsSectionView';
import {ModerationContentSectionView} from '#src/Components/Views/Moderation/Content/ModerationContentSectionView';
import {ModerationContentVisibilitySectionView} from '#src/Components/Views/Moderation/Content/ModerationContentVisibilitySectionView';
import {ModeratorForumThreadChangeCategoryButtonView} from '#src/Components/Views/Moderation/ModeratorForumThreadChangeCategoryButtonView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {ModerationDeletedWarningView} from '#src/Components/Views/Warnings/ModerationDeletedWarningView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {AppIcons} from '#src/Enums/Icons';
import {useModerationContentActions} from '#src/Hooks/Moderation/useModerationContentActions';
import {useRefresh} from '#src/Hooks/useRefresh';
import {alertDeleteModeratedContent} from '#src/Libraries/Alerts/ModerationAlerts';
import {forumDataFromModeration} from '#src/Libraries/Moderation/Content';
import {ShareContentType} from '#src/Libraries/Sharing';
import {
  CommonStackComponents,
  CommonStackParamList,
  useCommonStack,
} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useForumCategoriesQuery} from '#src/Queries/Forum/ForumCategoryQueries';
import {useForumDeleteMutation} from '#src/Queries/Forum/ForumThreadMutationQueries';
import {useForumModerationQuery} from '#src/Queries/Moderation/ModerationQueries';
import {ModeratorFeatureScreen} from '#src/Screens/Checkpoint/ModeratorFeatureScreen';
import {ForumEditLogData, ForumModerationData} from '#src/Structs/ControllerStructs';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.moderateForumThreadScreen>;

const ModerateForumThreadScreenInner = ({route}: Props) => {
  const {id} = route.params;
  const navigation = useCommonStack();
  const {setSnackbarPayload} = useSnackbar();
  const {data, refetch, isLoading} = useForumModerationQuery(id);
  const {data: categories} = useForumCategoriesQuery();
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const actions = useModerationContentActions(ForumModerationData.getCacheKeys(id, data?.categoryID));
  const deleteMutation = useForumDeleteMutation();
  const getNavButtons = useModerationHeaderButtons({
    contentType: ShareContentType.forum,
    contentID: id,
    contentIcon: AppIcons.forum,
    moderateType: ShareContentType.forumModerate,
    moderateID: id,
  });

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  /**
   * Renders one previous forum title as a compact content row.
   */
  const renderEdit = useCallback((edit: ForumEditLogData) => {
    return <ModerationEditListItem author={edit.author} timestamp={edit.createdAt} text={edit.title} />;
  }, []);

  if (isLoading || !data) {
    return <LoadingView refreshing={refreshing} onRefresh={onRefresh} />;
  }

  const currentCategory = categories?.find(category => category.categoryID === data.categoryID);

  const onDelete = () => {
    alertDeleteModeratedContent('forum', () => {
      deleteMutation.mutate(
        {forumID: id},
        {
          onSuccess: async () => {
            await actions.invalidate();
            setSnackbarPayload({message: 'Forum deleted.', messageType: 'info'});
          },
        },
      );
    });
  };

  const onEdit = () => {
    navigation.push(CommonStackComponents.forumThreadEditScreen, {
      forumData: forumDataFromModeration(data),
      intent: 'moderate',
    });
  };

  /**
   * Pass the unmasked title. Public `/forum/{id}` replaces quarantined
   * titles with "Forum Title is under moderator review".
   */
  const onViewInContext = () => {
    navigation.push(CommonStackComponents.forumThreadScreen, {
      forumID: data.forumID,
      titleOverride: data.title,
    });
  };

  return (
    <AppView>
      <ModerationDeletedWarningView contentLabel={'forum'} visible={data.isDeleted} />
      <ScrollingContentView
        isStack={true}
        overScroll={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <ModerationContentSectionView
          testIDPrefix={'forumModerate'}
          onViewInContext={onViewInContext}
          disabled={data.isDeleted}>
          <ModerateForumThreadListItem data={data} categoryTitle={currentCategory?.title} />
        </ModerationContentSectionView>
        <ModerationContentVisibilitySectionView
          data={data}
          testIDPrefix={'forumModerate'}
          onEdit={onEdit}
          onDelete={onDelete}
          isDeleting={deleteMutation.isPending}>
          <ModeratorForumThreadChangeCategoryButtonView
            forumID={id}
            currentCategoryID={data.categoryID}
            isDeleted={data.isDeleted}
          />
        </ModerationContentVisibilitySectionView>
        <ModerationContentHistorySectionView header={'Title History'} edits={data.edits} renderEdit={renderEdit} />
        <ModerationContentReportsSectionView reports={data.reports} />
      </ScrollingContentView>
      <ModeratorReportFAB
        reports={data.reports}
        moderateUserID={data.creator.userID}
        testIDPrefix={'forumModerate'}
        onHandleAll={() => actions.handleAll(data.reports)}
        onCloseAll={() => actions.closeAll(data.reports)}
      />
    </AppView>
  );
};

export const ModerateForumThreadScreen = (props: Props) => {
  return (
    <ModeratorFeatureScreen>
      <ModerateForumThreadScreenInner {...props} />
    </ModeratorFeatureScreen>
  );
};
