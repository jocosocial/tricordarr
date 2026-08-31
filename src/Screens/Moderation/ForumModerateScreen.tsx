import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useQueryClient} from '@tanstack/react-query';
import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Menu, Text} from 'react-native-paper';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {ModerationActionRow} from '#src/Components/Views/Moderation/ModerationActionRow';
import {ModerationContentPreview} from '#src/Components/Views/Moderation/ModerationContentPreview';
import {ModerationDeletedNotice} from '#src/Components/Views/Moderation/ModerationDeletedNotice';
import {ModerationReportsSection} from '#src/Components/Views/Moderation/ModerationReportsSection';
import {ModerationStateActions} from '#src/Components/Views/Moderation/ModerationStateActions';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useMenu} from '#src/Hooks/useMenu';
import {useModerationContentActions} from '#src/Hooks/useModerationContentActions';
import {useModerationHelpHeader} from '#src/Hooks/useModerationHelpHeader';
import {useRefresh} from '#src/Hooks/useRefresh';
import {alertDeleteModeratedContent} from '#src/Libraries/Alerts/ModerationAlerts';
import {forumDataFromModeration} from '#src/Libraries/Moderation';
import {pushModerateResource} from '#src/Libraries/ModerationNavigation';
import {invalidateQueryKeys} from '#src/Libraries/QueryInvalidation';
import {
  CommonStackComponents,
  CommonStackParamList,
  useCommonStack,
} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useForumCategoriesQuery} from '#src/Queries/Forum/ForumCategoryQueries';
import {useForumDeleteMutation} from '#src/Queries/Forum/ForumThreadMutationQueries';
import {useForumSetCategoryMutation} from '#src/Queries/Moderation/ModerationMutations';
import {useForumModerationQuery} from '#src/Queries/Moderation/ModerationQueries';
import {ModeratorFeatureScreen} from '#src/Screens/Checkpoint/ModeratorFeatureScreen';
import {ForumModerationData, ModeratorActionLogResponseData} from '#src/Structs/ControllerStructs';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.forumModerateScreen>;

const ForumModerateScreenInner = ({route}: Props) => {
  const {id} = route.params;
  const navigation = useCommonStack();
  const queryClient = useQueryClient();
  const {setSnackbarPayload} = useSnackbar();
  const {commonStyles} = useStyles();
  const {data, refetch, isLoading} = useForumModerationQuery(id);
  const {data: categories} = useForumCategoriesQuery();
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const actions = useModerationContentActions(ForumModerationData.getCacheKeys(id));
  const deleteMutation = useForumDeleteMutation();
  const setCategoryMutation = useForumSetCategoryMutation();
  const {visible, openMenu, closeMenu} = useMenu();
  useModerationHelpHeader();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          ...commonStyles.flexRow,
          ...commonStyles.flexWrap,
          ...commonStyles.alignItemsCenter,
          ...commonStyles.gapSmall,
        },
      }),
    [commonStyles],
  );

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

  const onSetCategory = (categoryID: string) => {
    closeMenu();
    setCategoryMutation.mutate(
      {forumID: id, categoryID},
      {
        onSuccess: async () => {
          await invalidateQueryKeys(
            queryClient,
            ForumModerationData.getCacheKeys(id).concat(ModeratorActionLogResponseData.getCacheKeys()),
          );
          setSnackbarPayload({message: 'Forum category updated.', messageType: 'info'});
        },
      },
    );
  };

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        overScroll={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <ModerationDeletedNotice contentLabel={'forum'} visible={data.isDeleted} />
        <PaddedContentView padTop={true}>
          <ModerationContentPreview author={data.creator} timestamp={data.createdAt} text={data.title} />
          <Text>Category: {currentCategory?.title ?? data.categoryID}</Text>
        </PaddedContentView>
        <PaddedContentView>
          <ModerationActionRow
            buttons={[
              {
                label: 'Rename',
                disabled: data.isDeleted,
                onPress: () =>
                  navigation.push(CommonStackComponents.forumThreadEditScreen, {
                    forumData: forumDataFromModeration(data),
                  }),
              },
              {
                label: 'Delete',
                disabled: data.isDeleted || deleteMutation.isPending,
                onPress: onDelete,
              },
              {
                label: 'Mod User',
                onPress: () => pushModerateResource(navigation, 'user', data.creator.userID),
              },
              {
                label: 'View Thread',
                onPress: () => navigation.push(CommonStackComponents.forumThreadScreen, {forumID: data.forumID}),
              },
            ]}
          />
        </PaddedContentView>
        <PaddedContentView>
          <View style={styles.row}>
            <Menu
              visible={visible}
              onDismiss={closeMenu}
              anchor={
                <Button
                  mode={'contained'}
                  compact={true}
                  disabled={data.isDeleted || setCategoryMutation.isPending}
                  onPress={openMenu}>
                  Change Category
                </Button>
              }>
              {(categories ?? []).map(category => (
                <Menu.Item
                  key={category.categoryID}
                  dense={false}
                  title={category.title}
                  disabled={category.categoryID === data.categoryID}
                  onPress={() => onSetCategory(category.categoryID)}
                />
              ))}
            </Menu>
          </View>
        </PaddedContentView>
        <PaddedContentView>
          <ModerationStateActions
            status={data.moderationStatus}
            disabled={data.isDeleted}
            isLoading={actions.isLoading}
            onSelect={state => actions.setState('forum', id, state)}
          />
        </PaddedContentView>
        <ListSection>
          <ListSubheader>Title History</ListSubheader>
        </ListSection>
        {data.edits.length === 0 ? (
          <PaddedContentView padTop={true}>
            <Text>No previous title edits.</Text>
          </PaddedContentView>
        ) : (
          data.edits.map(edit => (
            <PaddedContentView key={edit.editID} padTop={true}>
              <ModerationContentPreview author={edit.author} timestamp={edit.createdAt} text={edit.title} />
            </PaddedContentView>
          ))
        )}
        <ModerationReportsSection
          reports={data.reports}
          contentLabel={'forum'}
          isLoading={actions.isLoading}
          onHandleAll={() => actions.handleAll(data.reports)}
          onCloseAll={() => actions.closeAll(data.reports)}
        />
      </ScrollingContentView>
    </AppView>
  );
};

export const ForumModerateScreen = (props: Props) => {
  return (
    <ModeratorFeatureScreen>
      <ForumModerateScreenInner {...props} />
    </ModeratorFeatureScreen>
  );
};
