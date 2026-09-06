import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';

import {ModeratorReportFAB} from '#src/Components/Buttons/FloatingActionButtons/ModeratorReportFAB';
import {useModerationHeaderButtons} from '#src/Components/Buttons/HeaderButtons/ModerationHeaderButtons';
import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {ModeratorContentSegmentedButtons} from '#src/Components/Buttons/SegmentedButtons/ModeratorContentSegmentedButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {ModerationEditList} from '#src/Components/Views/Moderation/ModerationEditList';
import {ModerationEditListItem} from '#src/Components/Views/Moderation/ModerationEditListItem';
import {ModerationNoReportsView} from '#src/Components/Views/Moderation/ModerationNoReportsView';
import {ModerationReportListItem} from '#src/Components/Views/Moderation/ModerationReportListItem';
import {ModeratorForumCategoryView} from '#src/Components/Views/Moderation/ModeratorForumCategoryView';
import {ModeratorStateView} from '#src/Components/Views/Moderation/ModeratorStateView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {ModerationDeletedWarningView} from '#src/Components/Views/Warnings/ModerationDeletedWarningView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
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
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();
  const {data, refetch, isLoading} = useForumModerationQuery(id);
  const {data: categories} = useForumCategoriesQuery();
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const actions = useModerationContentActions(ForumModerationData.getCacheKeys(id));
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

  const styles = useMemo(
    () =>
      StyleSheet.create({
        editDelete: {
          ...commonStyles.paddingHorizontalSmall,
          ...commonStyles.paddingBottomSmall,
        },
      }),
    [commonStyles],
  );

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

  return (
    <AppView>
      <ModerationDeletedWarningView contentLabel={'forum'} visible={data.isDeleted} />
      <ScrollingContentView
        isStack={true}
        overScroll={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <ListSection>
          <ListSubheader>Content</ListSubheader>
        </ListSection>
        <PaddedContentView>
          <ModerationEditListItem author={data.creator} timestamp={data.createdAt} text={data.title} />
          <Text>Category: {currentCategory?.title ?? data.categoryID}</Text>
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton
            testID={'forumModerateView-button'}
            buttonText={'View Thread'}
            buttonColor={theme.colors.twitarrNeutralButton}
            disabled={data.isDeleted}
            onPress={() => navigation.push(CommonStackComponents.forumThreadScreen, {forumID: data.forumID})}
          />
        </PaddedContentView>
        <ListSection>
          <ListSubheader>Visibility</ListSubheader>
        </ListSection>
        <ModeratorStateView data={data} />
        {!data.isDeleted && (
          <View style={styles.editDelete}>
            <ModeratorContentSegmentedButtons
              testIDPrefix={'forumModerate'}
              onEdit={() =>
                navigation.push(CommonStackComponents.forumThreadEditScreen, {
                  forumData: forumDataFromModeration(data),
                })
              }
              onDelete={onDelete}
              isDeleting={deleteMutation.isPending}
            />
          </View>
        )}
        <ModeratorForumCategoryView forumID={id} currentCategoryID={data.categoryID} isDeleted={data.isDeleted} />
        <ModerationEditList header={'Title History'} edits={data.edits} renderEdit={renderEdit} />
        <ListSection>
          <ListSubheader>Reports</ListSubheader>
        </ListSection>
        {data.reports.length === 0 ? (
          <ModerationNoReportsView />
        ) : (
          data.reports.map(report => <ModerationReportListItem key={report.id} report={report} />)
        )}
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
