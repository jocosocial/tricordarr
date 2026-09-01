import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback} from 'react';
import {Text} from 'react-native-paper';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {EventFeedbackReportListItem} from '#src/Components/Lists/Items/Admin/EventFeedbackReportListItem';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {ListTitleView} from '#src/Components/Views/ListTitleView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useAdminHelpButton} from '#src/Hooks/Admin/useAdminHelpButton';
import {useRefresh} from '#src/Hooks/useRefresh';
import {getEventFeedbackResponseRate} from '#src/Libraries/Admin/EventFeedbackCsv';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useEventFeedbackReportsQuery, useEventFeedbackStatsQuery} from '#src/Queries/Admin/EventFeedbackQueries';
import {AdminAccessScreen} from '#src/Screens/Checkpoint/AdminAccessScreen';
import {EventFeedbackReport} from '#src/Structs/ControllerStructs';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.adminEventFeedbackReportsScreen>;

/**
 * Admin list of shadow event feedback reports with summary stats.
 */
export const AdminEventFeedbackReportsScreen = (props: Props) => {
  return (
    <AdminAccessScreen minAccess={'twitarrteam'}>
      <AdminEventFeedbackReportsScreenInner {...props} />
    </AdminAccessScreen>
  );
};

const AdminEventFeedbackReportsScreenInner = ({navigation}: Props) => {
  const {data: reports, refetch: refetchReports, isLoading: isLoadingReports} = useEventFeedbackReportsQuery();
  const {data: stats, refetch: refetchStats, isLoading: isLoadingStats} = useEventFeedbackStatsQuery();
  const refreshBoth = useCallback(async () => {
    await Promise.all([refetchReports(), refetchStats()]);
  }, [refetchReports, refetchStats]);
  const {refreshing, onRefresh} = useRefresh({refresh: refreshBoth});
  useAdminHelpButton(CommonStackComponents.eventFeedbackHelpScreen);

  if ((isLoadingReports && !reports) || (isLoadingStats && !stats)) {
    return <LoadingView />;
  }

  const reportsWithIds = (reports ?? []).filter((report): report is EventFeedbackReport & {id: string} => !!report.id);

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        overScroll={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <ListTitleView title={'Stats'} />
        {stats && (
          <>
            <DataFieldListItem title={'Total Shadow Events on Sched'} description={stats.totalShadowEvents} />
            <DataFieldListItem title={'Completed Shadow Events'} description={stats.completedShadowEvents} />
            <DataFieldListItem title={'Feedback Received'} description={stats.totalFeedbackReports} />
            <DataFieldListItem title={'Unique Events with Feedback'} description={stats.uniqueEventsWithFeedback} />
            <DataFieldListItem title={'Response Rate'} description={getEventFeedbackResponseRate(stats)} />
          </>
        )}
        <ListTitleView title={'Reports'} />
        {!reportsWithIds.length && (
          <PaddedContentView padTop={true}>
            <Text>No feedback reports.</Text>
          </PaddedContentView>
        )}
        {reportsWithIds.map(report => (
          <EventFeedbackReportListItem
            key={report.id}
            report={report}
            onPress={() =>
              navigation.push(CommonStackComponents.adminEventFeedbackReportScreen, {feedbackID: report.id})
            }
          />
        ))}
      </ScrollingContentView>
    </AppView>
  );
};
