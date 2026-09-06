import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useEffect} from 'react';

import {ModeratorReportFAB} from '#src/Components/Buttons/FloatingActionButtons/ModeratorReportFAB';
import {useModerationHeaderButtons} from '#src/Components/Buttons/HeaderButtons/ModerationHeaderButtons';
import {FezCard} from '#src/Components/Cards/Schedule/FezCard';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {ModerationEditListItem} from '#src/Components/Lists/Items/Moderation/ModerationEditListItem';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {ModerationContentAuthorSectionView} from '#src/Components/Views/Moderation/Content/ModerationContentAuthorSectionView';
import {ModerationContentHistorySectionView} from '#src/Components/Views/Moderation/Content/ModerationContentHistorySectionView';
import {ModerationContentReportsSectionView} from '#src/Components/Views/Moderation/Content/ModerationContentReportsSectionView';
import {ModerationContentSectionView} from '#src/Components/Views/Moderation/Content/ModerationContentSectionView';
import {ModerationContentVisibilitySectionView} from '#src/Components/Views/Moderation/Content/ModerationContentVisibilitySectionView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {ModerationDeletedWarningView} from '#src/Components/Views/Warnings/ModerationDeletedWarningView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {FezType} from '#src/Enums/FezType';
import {useModerationContentActions} from '#src/Hooks/Moderation/useModerationContentActions';
import {useRefresh} from '#src/Hooks/useRefresh';
import {alertDeleteModeratedContent, alertViewPrivateSeamail} from '#src/Libraries/Alerts/ModerationAlerts';
import {getFezPublicShare} from '#src/Libraries/Moderation/Share';
import {ShareContentType} from '#src/Libraries/Sharing';
import {
  CommonStackComponents,
  CommonStackParamList,
  useCommonStack,
} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useFezDeleteMutation} from '#src/Queries/Fez/FezMutations';
import {useFezModerationQuery} from '#src/Queries/Moderation/ModerationQueries';
import {ModeratorFeatureScreen} from '#src/Screens/Checkpoint/ModeratorFeatureScreen';
import {FezEditLogData, FezModerationData} from '#src/Structs/ControllerStructs';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.moderateFezScreen>;

const ModerateFezScreenInner = ({route}: Props) => {
  const {id} = route.params;
  const navigation = useCommonStack();
  const {setSnackbarPayload} = useSnackbar();
  const {data, refetch, isLoading} = useFezModerationQuery(id);
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const actions = useModerationContentActions(FezModerationData.getCacheKeys(id));
  const deleteMutation = useFezDeleteMutation();
  const fezShare = data ? getFezPublicShare(data.fez.fezType, data.fez.fezID) : undefined;
  const getNavButtons = useModerationHeaderButtons({
    moderateType: ShareContentType.fezModerate,
    moderateID: id,
    ...fezShare,
  });

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
      ...(data && {title: `Moderate ${FezType.getChatTypeString(data.fez.fezType)}`}),
    });
  }, [data, getNavButtons, navigation]);

  /**
   * Renders one previous fez title/info/location edit as a compact content row.
   */
  const renderEdit = useCallback((edit: FezEditLogData) => {
    return (
      <ModerationEditListItem
        author={edit.author}
        timestamp={edit.createdAt}
        text={[edit.title, edit.info, edit.location].filter(Boolean).join('\n')}
      />
    );
  }, []);

  if (isLoading || !data) {
    return <LoadingView refreshing={refreshing} onRefresh={onRefresh} />;
  }

  const fez = data.fez;
  const isLfg = FezType.isLFGType(fez.fezType);
  const isPrivateEvent = FezType.isPrivateEventType(fez.fezType);
  const isSeamail = FezType.isSeamailType(fez.fezType);
  const contentLabel = FezType.getChatTypeString(fez.fezType);

  const onDelete = () => {
    alertDeleteModeratedContent(contentLabel, () => {
      deleteMutation.mutate(
        {fezID: fez.fezID},
        {
          onSuccess: async () => {
            await actions.invalidate();
            setSnackbarPayload({message: `${contentLabel} deleted.`, messageType: 'info'});
          },
        },
      );
    });
  };

  const onEdit = () => {
    if (isLfg) {
      navigation.push(CommonStackComponents.lfgEditScreen, {
        fez,
        intent: 'moderate',
      });
      return;
    }
    if (isPrivateEvent) {
      navigation.push(CommonStackComponents.personalEventEditScreen, {
        personalEvent: fez,
        intent: 'moderate',
      });
      return;
    }
    navigation.push(CommonStackComponents.seamailEditScreen, {
      fezID: fez.fezID,
      intent: 'moderate',
    });
  };

  const onViewInContext = () => {
    if (isLfg) {
      navigation.push(CommonStackComponents.lfgScreen, {fezID: fez.fezID});
      return;
    }
    if (isPrivateEvent) {
      navigation.push(CommonStackComponents.personalEventScreen, {eventID: fez.fezID});
      return;
    }
    alertViewPrivateSeamail(() => {
      navigation.push(CommonStackComponents.seamailChatScreen, {fezID: fez.fezID});
    });
  };

  return (
    <AppView>
      <ModerationDeletedWarningView contentLabel={contentLabel} visible={data.isDeleted} />
      <ScrollingContentView
        isStack={true}
        overScroll={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <ModerationContentSectionView testIDPrefix={'fezModerate'} onViewInContext={onViewInContext}>
          <PaddedContentView padTop={true}>
            <FezCard fez={fez} showDay={true} showIcon={true} disabled={true} />
          </PaddedContentView>
        </ModerationContentSectionView>
        <ModerationContentVisibilitySectionView
          data={data}
          testIDPrefix={'fezModerate'}
          onEdit={onEdit}
          onDelete={onDelete}
          isDeleting={deleteMutation.isPending}
        />
        <ModerationContentHistorySectionView edits={data.edits} renderEdit={renderEdit} />
        <ModerationContentReportsSectionView
          reports={data.reports}
          emptyMessage={isSeamail ? 'Seamails cannot be reported.' : undefined}
        />
        <ModerationContentAuthorSectionView moderateUserID={fez.owner.userID} />
      </ScrollingContentView>
      <ModeratorReportFAB
        reports={data.reports}
        testIDPrefix={'fezModerate'}
        onHandleAll={() => actions.handleAll(data.reports)}
        onCloseAll={() => actions.closeAll(data.reports)}
      />
    </AppView>
  );
};

export const ModerateFezScreen = (props: Props) => {
  return (
    <ModeratorFeatureScreen>
      <ModerateFezScreenInner {...props} />
    </ModeratorFeatureScreen>
  );
};
