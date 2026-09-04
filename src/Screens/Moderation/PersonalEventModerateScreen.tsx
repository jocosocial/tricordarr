import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {Text} from 'react-native-paper';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {UserBylineTag} from '#src/Components/Text/Tags/UserBylineTag';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {ModerationActionRow} from '#src/Components/Views/Moderation/ModerationActionRow';
import {ModerationContentPreview} from '#src/Components/Views/Moderation/ModerationContentPreview';
import {ModerationReportListItem} from '#src/Components/Views/Moderation/ModerationReportListItem';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {ModerationDeletedWarningView} from '#src/Components/Views/Warnings/ModerationDeletedWarningView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useModerationContentActions} from '#src/Hooks/useModerationContentActions';
import {useModerationHelpHeader} from '#src/Hooks/useModerationHelpHeader';
import {useRefresh} from '#src/Hooks/useRefresh';
import {alertRemovePersonalEventMember} from '#src/Libraries/Alerts/ModerationAlerts';
import {pushModerateResource} from '#src/Libraries/ModerationNavigation';
import {
  CommonStackComponents,
  CommonStackParamList,
  useCommonStack,
} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {usePersonalEventMemberRemoveMutation} from '#src/Queries/Moderation/ModerationMutations';
import {usePersonalEventModerationQuery} from '#src/Queries/Moderation/ModerationQueries';
import {ModeratorFeatureScreen} from '#src/Screens/Checkpoint/ModeratorFeatureScreen';
import {PersonalEventModerationData} from '#src/Structs/ControllerStructs';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.personalEventModerateScreen>;

const PersonalEventModerateScreenInner = ({route}: Props) => {
  const {id} = route.params;
  const navigation = useCommonStack();
  const {setSnackbarPayload} = useSnackbar();
  const {data, refetch, isLoading} = usePersonalEventModerationQuery(id);
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const actions = useModerationContentActions(PersonalEventModerationData.getCacheKeys(id));
  const removeMutation = usePersonalEventMemberRemoveMutation();
  useModerationHelpHeader();

  if (isLoading || !data) {
    return <LoadingView refreshing={refreshing} onRefresh={onRefresh} />;
  }

  const event = data.personalEvent;

  const onRemove = (userID: string, username: string) => {
    alertRemovePersonalEventMember(username, () => {
      removeMutation.mutate(
        {eventID: id, userID},
        {
          onSuccess: async () => {
            await actions.invalidate();
            setSnackbarPayload({message: `@${username} removed from this personal event.`, messageType: 'info'});
          },
        },
      );
    });
  };

  return (
    <AppView>
      <ModerationDeletedWarningView contentLabel={'personal event'} visible={data.isDeleted} />
      <ScrollingContentView
        isStack={true}
        overScroll={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <PaddedContentView padTop={true}>
          <ModerationContentPreview
            author={event.owner}
            timestamp={event.startTime}
            text={[event.title, event.description, event.location].filter(Boolean).join('\n')}
          />
          <Text>
            {event.startTime} – {event.endTime}
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text>
            Personal events cannot be quarantined in the site UI. Remove participants or moderate the owner if needed.
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <ModerationActionRow
            buttons={[
              {
                label: 'Mod Owner',
                onPress: () => pushModerateResource(navigation, 'user', event.owner.userID),
              },
              {
                label: 'View Event',
                onPress: () => navigation.push(CommonStackComponents.personalEventScreen, {eventID: id}),
              },
            ]}
          />
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
        <ListSection>
          <ListSubheader>Reports</ListSubheader>
        </ListSection>
        {data.reports.length === 0 ? (
          <PaddedContentView padTop={true}>
            <Text>No reports on this personal event.</Text>
          </PaddedContentView>
        ) : (
          data.reports.map(report => <ModerationReportListItem key={report.id} report={report} />)
        )}
      </ScrollingContentView>
    </AppView>
  );
};

export const PersonalEventModerateScreen = (props: Props) => {
  return (
    <ModeratorFeatureScreen>
      <PersonalEventModerateScreenInner {...props} />
    </ModeratorFeatureScreen>
  );
};
