import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect} from 'react';

import {ModeratorReportFAB} from '#src/Components/Buttons/FloatingActionButtons/ModeratorReportFAB';
import {useModerationHeaderButtons} from '#src/Components/Buttons/HeaderButtons/ModerationHeaderButtons';
import {FezCard} from '#src/Components/Cards/Schedule/FezCard';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {ModerationContentAuthorSectionView} from '#src/Components/Views/Moderation/Content/ModerationContentAuthorSectionView';
import {ModerationContentParticipantsSectionView} from '#src/Components/Views/Moderation/Content/ModerationContentParticipantsSectionView';
import {ModerationContentReportsSectionView} from '#src/Components/Views/Moderation/Content/ModerationContentReportsSectionView';
import {ModerationContentSectionView} from '#src/Components/Views/Moderation/Content/ModerationContentSectionView';
import {ModerationContentVisibilitySectionView} from '#src/Components/Views/Moderation/Content/ModerationContentVisibilitySectionView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {ModerationDeletedWarningView} from '#src/Components/Views/Warnings/ModerationDeletedWarningView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {FezType} from '#src/Enums/FezType';
import {AppIcons} from '#src/Enums/Icons';
import {useModerationContentActions} from '#src/Hooks/Moderation/useModerationContentActions';
import {useRefresh} from '#src/Hooks/useRefresh';
import {alertRemovePrivateEventMember} from '#src/Libraries/Alerts/ModerationAlerts';
import {ShareContentType} from '#src/Libraries/Sharing';
import {
  CommonStackComponents,
  CommonStackParamList,
  useCommonStack,
} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {usePrivateEventMemberRemoveMutation} from '#src/Queries/Moderation/ModerationMutations';
import {usePrivateEventModerationQuery} from '#src/Queries/Moderation/ModerationQueries';
import {ModeratorFeatureScreen} from '#src/Screens/Checkpoint/ModeratorFeatureScreen';
import {FezData, PersonalEventModerationData, UserHeader} from '#src/Structs/ControllerStructs';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.moderatePrivateEventScreen>;

const ModeratePrivateEventScreenInner = ({route}: Props) => {
  const {id} = route.params;
  const navigation = useCommonStack();
  const {setSnackbarPayload} = useSnackbar();
  const {data, refetch, isLoading} = usePrivateEventModerationQuery(id);
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const actions = useModerationContentActions(PersonalEventModerationData.getCacheKeys(id));
  const removeMutation = usePrivateEventMemberRemoveMutation();
  const getNavButtons = useModerationHeaderButtons({
    contentType: ShareContentType.privateEvent,
    contentID: id,
    contentIcon: AppIcons.personalEvent,
    moderateType: ShareContentType.privateEventModerate,
    moderateID: id,
  });

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  if (isLoading || !data) {
    return <LoadingView refreshing={refreshing} onRefresh={onRefresh} />;
  }

  const event = data.personalEvent;

  /**
   * The moderation API returns a trimmed-down PersonalEventData rather than a full FezData,
   * so adapt it here to reuse FezCard for consistent content rendering across moderation screens.
   */
  const fez: FezData = {
    fezID: event.personalEventID,
    owner: event.owner,
    fezType: FezType.privateEvent,
    title: event.title,
    info: event.description ?? '',
    startTime: event.startTime,
    endTime: event.endTime,
    timeZone: event.timeZone,
    timeZoneID: event.timeZoneID,
    location: event.location,
    participantCount: event.participants.length,
    minParticipants: 0,
    maxParticipants: event.participants.length,
    cancelled: false,
    lastModificationTime: event.lastUpdateTime,
  };

  /**
   * Confirms and removes a participant from this private event.
   */
  const onRemove = (user: UserHeader) => {
    alertRemovePrivateEventMember(user.username, () => {
      removeMutation.mutate(
        {eventID: id, userID: user.userID},
        {
          onSuccess: async () => {
            await actions.invalidate();
            setSnackbarPayload({message: `@${user.username} removed from this private event.`, messageType: 'info'});
          },
        },
      );
    });
  };

  /**
   * Opens the public private-event screen for this item.
   */
  const onViewInContext = () => {
    navigation.push(CommonStackComponents.personalEventScreen, {eventID: id});
  };

  return (
    <AppView>
      <ModerationDeletedWarningView contentLabel={'private event'} visible={data.isDeleted} />
      <ScrollingContentView
        isStack={true}
        overScroll={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <ModerationContentSectionView testIDPrefix={'privateEventModerate'} onViewInContext={onViewInContext}>
          <PaddedContentView padTop={true}>
            <FezCard fez={fez} showDay={true} showIcon={true} disabled={true} showDescription={true} />
          </PaddedContentView>
        </ModerationContentSectionView>
        <ModerationContentVisibilitySectionView
          canChangeState={false}
          isDeleted={data.isDeleted}
          testIDPrefix={'privateEventModerate'}
        />
        <ModerationContentParticipantsSectionView
          participants={event.participants}
          owner={event.owner}
          isDeleted={data.isDeleted}
          isRemoving={removeMutation.isPending}
          onRemove={onRemove}
        />
        <ModerationContentReportsSectionView reports={data.reports} />
        <ModerationContentAuthorSectionView moderateUserID={event.owner.userID} />
      </ScrollingContentView>
      <ModeratorReportFAB
        reports={data.reports}
        testIDPrefix={'personalEventModerate'}
        onHandleAll={() => actions.handleAll(data.reports)}
        onCloseAll={() => actions.closeAll(data.reports)}
      />
    </AppView>
  );
};

export const ModeratePrivateEventScreen = (props: Props) => {
  return (
    <ModeratorFeatureScreen>
      <ModeratePrivateEventScreenInner {...props} />
    </ModeratorFeatureScreen>
  );
};
