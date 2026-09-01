import {StackScreenProps} from '@react-navigation/stack';
import moment from 'moment-timezone';
import React, {useMemo} from 'react';
import {StyleSheet, Switch, View} from 'react-native';
import {Text} from 'react-native-paper';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {getUserBylineString} from '#src/Components/Text/Tags/UserBylineTag';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {useAdminHelpButton} from '#src/Hooks/Admin/useAdminHelpButton';
import {useRefresh} from '#src/Hooks/useRefresh';
import {getEventTimeString} from '#src/Libraries/DateTime';
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
  const {commonStyles} = useStyles();
  useAdminHelpButton(CommonStackComponents.eventFeedbackHelpScreen);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        actionableRow: {
          ...commonStyles.flexRow,
          ...commonStyles.alignItemsCenter,
          ...commonStyles.justifySpaceBetween,
          ...commonStyles.paddingHorizontalSmall,
          ...commonStyles.paddingVerticalSmall,
        },
        actionableLabel: {
          ...commonStyles.onBackground,
        },
      }),
    [commonStyles],
  );

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

  const handleActionableChange = (value: boolean) => {
    if (!report.id) {
      return;
    }
    markMutation.mutate({feedbackID: report.id, actionable: value});
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
          <DataFieldListItem icon={AppIcons.map} title={'Location'} description={report.eventLocation} />
          <DataFieldListItem icon={AppIcons.time} title={'Event Time'} description={eventTimeLabel} />
          <DataFieldListItem
            icon={AppIcons.user}
            title={'Reporting User'}
            description={getUserBylineString(report.reportingUser, true, true)}
            onPress={() =>
              navigation.push(CommonStackComponents.userProfileScreen, {userID: report.reportingUser.userID})
            }
          />
          <DataFieldListItem icon={AppIcons.user} title={'Host Name'} description={report.hostName} />
          <DataFieldListItem icon={AppIcons.description} title={'Attendance'} description={report.attendance} />
          <DataFieldListItem icon={AppIcons.description} title={'Recap'} description={report.recapString} />
          <DataFieldListItem icon={AppIcons.description} title={'Issues'} description={report.issuesString} />
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
        <View style={styles.actionableRow}>
          <Text style={styles.actionableLabel}>Actionable</Text>
          <Switch
            value={report.adminFields?.actionable ?? false}
            onValueChange={handleActionableChange}
            disabled={markMutation.isPending}
          />
        </View>
      </ScrollingContentView>
    </AppView>
  );
};
