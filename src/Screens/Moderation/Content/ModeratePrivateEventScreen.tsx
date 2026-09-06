import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect} from 'react';
import {Text} from 'react-native-paper';

import {ModeratorReportFAB} from '#src/Components/Buttons/FloatingActionButtons/ModeratorReportFAB';
import {useModerationHeaderButtons} from '#src/Components/Buttons/HeaderButtons/ModerationHeaderButtons';
import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {ModerationEditListItem} from '#src/Components/Lists/Items/Moderation/ModerationEditListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {UserBylineTag} from '#src/Components/Text/Tags/UserBylineTag';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {ModerationContentAuthorSectionView} from '#src/Components/Views/Moderation/Content/ModerationContentAuthorSectionView';
import {ModerationContentReportsSectionView} from '#src/Components/Views/Moderation/Content/ModerationContentReportsSectionView';
import {ModerationActionRow} from '#src/Components/Views/Moderation/ModerationActionRow';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {ModerationDeletedWarningView} from '#src/Components/Views/Warnings/ModerationDeletedWarningView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {useModerationContentActions} from '#src/Hooks/Moderation/useModerationContentActions';
import {useRefresh} from '#src/Hooks/useRefresh';
import {alertRemovePrivateEventMember} from '#src/Libraries/Alerts/ModerationAlerts';
import {pushModerateResource} from '#src/Libraries/ModerationNavigation';
import {ShareContentType} from '#src/Libraries/Sharing';
import {
  CommonStackComponents,
  CommonStackParamList,
  useCommonStack,
} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {usePrivateEventMemberRemoveMutation} from '#src/Queries/Moderation/ModerationMutations';
import {usePrivateEventModerationQuery} from '#src/Queries/Moderation/ModerationQueries';
import {ModeratorFeatureScreen} from '#src/Screens/Checkpoint/ModeratorFeatureScreen';
import {PersonalEventModerationData} from '#src/Structs/ControllerStructs';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.moderatePrivateEventScreen>;

const ModeratePrivateEventScreenInner = ({route}: Props) => {
  const {id} = route.params;
  const navigation = useCommonStack();
  const {setSnackbarPayload} = useSnackbar();
  const {theme} = useAppTheme();
  const {data, refetch, isLoading} = usePrivateEventModerationQuery(id);
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const actions = useModerationContentActions(PersonalEventModerationData.getCacheKeys(id));
  const removeMutation = usePrivateEventMemberRemoveMutation();
  const getNavButtons = useModerationHeaderButtons({
    contentType: ShareContentType.personalEvent,
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

  const onRemove = (userID: string, username: string) => {
    alertRemovePrivateEventMember(username, () => {
      removeMutation.mutate(
        {eventID: id, userID},
        {
          onSuccess: async () => {
            await actions.invalidate();
            setSnackbarPayload({message: `@${username} removed from this private event.`, messageType: 'info'});
          },
        },
      );
    });
  };

  return (
    <AppView>
      <ModerationDeletedWarningView contentLabel={'private event'} visible={data.isDeleted} />
      <ScrollingContentView
        isStack={true}
        overScroll={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <ListSection>
          <ListSubheader>Content</ListSubheader>
        </ListSection>
        <PaddedContentView>
          <ModerationEditListItem
            author={event.owner}
            timestamp={event.startTime}
            text={[event.title, event.description, event.location].filter(Boolean).join('\n')}
          />
          <Text>
            {event.startTime} – {event.endTime}
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton
            testID={'privateEventModerateView-button'}
            buttonText={'View Event'}
            buttonColor={theme.colors.twitarrNeutralButton}
            onPress={() => navigation.push(CommonStackComponents.personalEventScreen, {eventID: id})}
          />
        </PaddedContentView>
        <PaddedContentView>
          <Text>
            Private events cannot be quarantined in the site UI. Remove participants or moderate the owner if needed.
          </Text>
        </PaddedContentView>
        <ListSection>
          <ListSubheader>Participants</ListSubheader>
        </ListSection>
        {event.participants.length === 0 ? (
          <PaddedContentView padTop={true}>
            <Text>No participants.</Text>
          </PaddedContentView>
        ) : (
          event.participants.map(participant => (
            <PaddedContentView key={participant.userID} padTop={true}>
              <UserBylineTag user={participant} />
              <ModerationActionRow
                buttons={[
                  {
                    label: 'Remove',
                    disabled: data.isDeleted || removeMutation.isPending,
                    onPress: () => onRemove(participant.userID, participant.username),
                  },
                  {
                    label: 'Mod User',
                    onPress: () => pushModerateResource(navigation, 'user', participant.userID),
                  },
                ]}
              />
            </PaddedContentView>
          ))
        )}
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
