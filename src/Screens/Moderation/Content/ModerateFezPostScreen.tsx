import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect} from 'react';

import {ModeratorReportFAB} from '#src/Components/Buttons/FloatingActionButtons/ModeratorReportFAB';
import {useModerationHeaderButtons} from '#src/Components/Buttons/HeaderButtons/ModerationHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {ModerationEditListItem} from '#src/Components/Lists/Items/Moderation/ModerationEditListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {ModerationContentReportsSectionView} from '#src/Components/Views/Moderation/Content/ModerationContentReportsSectionView';
import {ModerationContentSectionView} from '#src/Components/Views/Moderation/Content/ModerationContentSectionView';
import {ModerationActionRow} from '#src/Components/Views/Moderation/ModerationActionRow';
import {ModeratorStateView} from '#src/Components/Views/Moderation/ModeratorStateView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {ModerationDeletedWarningView} from '#src/Components/Views/Warnings/ModerationDeletedWarningView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {FezType} from '#src/Enums/FezType';
import {useModerationContentActions} from '#src/Hooks/Moderation/useModerationContentActions';
import {useRefresh} from '#src/Hooks/useRefresh';
import {alertDeleteModeratedContent} from '#src/Libraries/Alerts/ModerationAlerts';
import {getFezPublicShare} from '#src/Libraries/Moderation/Share';
import {ShareContentType} from '#src/Libraries/Sharing';
import {
  CommonStackComponents,
  CommonStackParamList,
  useCommonStack,
} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useFezPostDeleteMutation} from '#src/Queries/Fez/FezPostMutations';
import {useFezPostModerationQuery} from '#src/Queries/Moderation/ModerationQueries';
import {ModeratorFeatureScreen} from '#src/Screens/Checkpoint/ModeratorFeatureScreen';
import {FezPostModerationData} from '#src/Structs/ControllerStructs';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.moderateFezPostScreen>;

const ModerateFezPostScreenInner = ({route}: Props) => {
  const {id} = route.params;
  const navigation = useCommonStack();
  const {setSnackbarPayload} = useSnackbar();
  const {data, refetch, isLoading} = useFezPostModerationQuery(id);
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const actions = useModerationContentActions(FezPostModerationData.getCacheKeys(id));
  const deleteMutation = useFezPostDeleteMutation();
  const fezShare = data ? getFezPublicShare(data.fezType, data.fezID) : undefined;
  const getNavButtons = useModerationHeaderButtons({
    moderateType: ShareContentType.fezPostModerate,
    moderateID: id,
    ...fezShare,
  });

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  if (isLoading || !data) {
    return <LoadingView refreshing={refreshing} onRefresh={onRefresh} />;
  }

  const onDelete = () => {
    alertDeleteModeratedContent('post', () => {
      deleteMutation.mutate(
        {postID: id},
        {
          onSuccess: async () => {
            await actions.invalidate();
            setSnackbarPayload({message: 'Post deleted.', messageType: 'info'});
          },
        },
      );
    });
  };

  const onViewInContext = () => {
    navigation.push(FezType.getChatScreen(data.fezType), {
      fezID: data.fezID,
    });
  };

  return (
    <AppView>
      <ModerationDeletedWarningView contentLabel={'post'} visible={data.isDeleted} />
      <ScrollingContentView
        isStack={true}
        overScroll={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <ModerationContentSectionView testIDPrefix={'fezPostModerate'} onViewInContext={onViewInContext}>
          <PaddedContentView>
            <ModerationEditListItem
              author={data.fezPost.author}
              timestamp={data.fezPost.timestamp}
              text={data.fezPost.text}
              images={data.fezPost.image ? [data.fezPost.image] : undefined}
            />
          </PaddedContentView>
        </ModerationContentSectionView>
        <ListSection>
          <ListSubheader>Visibility</ListSubheader>
        </ListSection>
        <ModeratorStateView data={data} />
        {!data.isDeleted && (
          <PaddedContentView>
            <ModerationActionRow
              buttons={[
                {
                  label: 'Delete',
                  disabled: deleteMutation.isPending,
                  onPress: onDelete,
                },
              ]}
            />
          </PaddedContentView>
        )}
        <ModerationContentReportsSectionView reports={data.reports} />
      </ScrollingContentView>
      <ModeratorReportFAB
        reports={data.reports}
        moderateUserID={data.fezPost.author.userID}
        testIDPrefix={'fezPostModerate'}
        onHandleAll={() => actions.handleAll(data.reports)}
        onCloseAll={() => actions.closeAll(data.reports)}
      />
    </AppView>
  );
};

export const ModerateFezPostScreen = (props: Props) => {
  return (
    <ModeratorFeatureScreen>
      <ModerateFezPostScreenInner {...props} />
    </ModeratorFeatureScreen>
  );
};
