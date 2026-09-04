import {StackScreenProps} from '@react-navigation/stack';
import moment from 'moment-timezone';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {EventLocationActionsMenu} from '#src/Components/Menus/Events/EventLocationActionsMenu';
import {getUserBylineString} from '#src/Components/Text/Tags/UserBylineTag';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useCruise} from '#src/Context/Contexts/CruiseContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {useRefresh} from '#src/Hooks/useRefresh';
import {useTimeZone} from '#src/Hooks/useTimeZone';
import {calcCruiseDayTime, getEventTimeString} from '#src/Libraries/DateTime';
import {guessDeckNumber} from '#src/Libraries/Ship';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useEventFeedbackMarkMutation} from '#src/Queries/Admin/EventFeedbackMutations';
import {useEventFeedbackReportQuery} from '#src/Queries/Admin/EventFeedbackQueries';
import {AdminAccessScreen} from '#src/Screens/Checkpoint/AdminAccessScreen';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.adminEventFeedbackReportScreen>;

/**
 * Full details of a single shadow event feedback report.
 */
export const AdminEventFeedbackReportScreen = (props: Props) => {
  return (
    <AdminAccessScreen minAccess={'twitarrteam'}>
      <AdminEventFeedbackReportScreenInner {...props} />
    </AdminAccessScreen>
  );
};

const AdminEventFeedbackReportScreenInner = ({navigation, route}: Props) => {
  const {feedbackID} = route.params;
  const {data: report, refetch, isLoading} = useEventFeedbackReportQuery({feedbackID});
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const markMutation = useEventFeedbackMarkMutation();
  const {appConfig} = useConfig();
  const {theme} = useAppTheme();
  const {startDate, endDate} = useCruise();
  const {tzAtTime} = useTimeZone();
  const isActionable = report?.adminFields?.actionable ?? false;

  const handleActionableToggle = useCallback(() => {
    if (!report?.id || markMutation.isPending) {
      return;
    }
    markMutation.mutate({feedbackID: report.id, actionable: !isActionable});
  }, [isActionable, markMutation, report?.id]);

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          {report && (
            <Item
              title={'Actionable'}
              iconName={AppIcons.actionable}
              color={isActionable ? theme.colors.twitarrNeutralButton : undefined}
              onPress={handleActionableToggle}
              testID={'headerActionable-headerButton'}
            />
          )}
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.eventFeedbackHelpScreen, {mode: 'admin'})}
          />
        </MaterialHeaderButtons>
      </View>
    );
  }, [handleActionableToggle, isActionable, navigation, report, theme.colors.twitarrNeutralButton]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  if (isLoading && !report) {
    return <LoadingView />;
  }

  if (!report) {
    return (
      <AppView>
        <PaddedContentView padTop={true}>
          <Text>Feedback report not found.</Text>
        </PaddedContentView>
      </AppView>
    );
  }

  const eventTimeLabel = report.event?.timeZoneID
    ? getEventTimeString(report.eventTime, report.event.timeZoneID, appConfig.schedule.timeZoneLabelMode)
    : moment(report.eventTime).format('ddd MMM D hh:mm A z');
  const filedAtLabel = report.reportModDate
    ? report.event?.timeZoneID
      ? getEventTimeString(report.reportModDate, report.event.timeZoneID, appConfig.schedule.timeZoneLabelMode)
      : moment(report.reportModDate).format('ddd MMM D hh:mm A z')
    : undefined;
  const followCount = report.adminFields?.followCount ?? 0;
  const forumPostCount = report.adminFields?.forumPostCount ?? 0;
  const forumID = report.adminFields?.forumID;
  const eventID = report.event?.eventID;

  /**
   * Opens the deck map for this report's location.
   */
  const handleMap = () => {
    navigation.push(CommonStackComponents.mapScreen, {
      deckNumber: guessDeckNumber(report.eventLocation),
    });
  };

  /**
   * Opens the reports list limited to this reporting user.
   */
  const handleReportingUser = () => {
    navigation.push(CommonStackComponents.adminEventFeedbackReportsScreen, {
      userID: report.reportingUser.userID,
    });
  };

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        overScroll={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <ListSection>
          <DataFieldListItem
            icon={AppIcons.events}
            title={'Event'}
            description={report.eventTitle}
            onPress={eventID ? () => navigation.push(CommonStackComponents.eventScreen, {eventID}) : undefined}
          />
          <EventLocationActionsMenu
            location={report.eventLocation}
            cruiseDay={calcCruiseDayTime(new Date(report.eventTime), startDate, endDate, tzAtTime).cruiseDay}
            onPress={handleMap}
            enableReports={true}
          />
          <DataFieldListItem icon={AppIcons.time} title={'Event Time'} description={eventTimeLabel} />
          <DataFieldListItem
            icon={AppIcons.user}
            title={'Reporting User'}
            description={getUserBylineString(report.reportingUser, true, true)}
            onPress={handleReportingUser}
          />
          <DataFieldListItem icon={AppIcons.user} title={'Host Name'} description={report.hostName} />
          <DataFieldListItem icon={AppIcons.description} title={'Attendance'} description={report.attendance} />
          {!!report.recapString.trim() && (
            <DataFieldListItem icon={AppIcons.description} title={'Recap'} description={report.recapString} />
          )}
          {!!report.issuesString.trim() && (
            <DataFieldListItem icon={AppIcons.description} title={'Issues'} description={report.issuesString} />
          )}
          <DataFieldListItem
            icon={AppIcons.favorite}
            title={'Follow Count'}
            description={`${followCount} ${followCount === 1 ? 'user is' : 'users are'} following this event.`}
          />
          <DataFieldListItem
            icon={AppIcons.forum}
            title={'Forum Posts'}
            description={`${forumPostCount} ${forumPostCount === 1 ? 'post' : 'posts'}`}
            onPress={forumID ? () => navigation.push(CommonStackComponents.forumThreadScreen, {forumID}) : undefined}
          />
          {filedAtLabel && <DataFieldListItem icon={AppIcons.time} title={'Filed At'} description={filedAtLabel} />}
        </ListSection>
      </ScrollingContentView>
    </AppView>
  );
};
