import {StackScreenProps} from '@react-navigation/stack';
import {type FlashListRef} from '@shopify/flash-list';
import React, {useCallback, useMemo, useRef} from 'react';
import {Divider} from 'react-native-paper';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {AppFlashList} from '#src/Components/Lists/AppFlashList';
import {EndResultsFooter} from '#src/Components/Lists/Footers/EndResultsFooter';
import {NoResultsFooter} from '#src/Components/Lists/Footers/NoResultsFooter';
import {EventFeedbackReportListItem} from '#src/Components/Lists/Items/Admin/EventFeedbackReportListItem';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {AppView} from '#src/Components/Views/AppView';
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

type EventFeedbackReportWithId = EventFeedbackReport & {id: string};

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

const AdminEventFeedbackReportsScreenInner = (_props: Props) => {
  const listRef = useRef<FlashListRef<EventFeedbackReportWithId>>(null);
  const {data: reports, refetch: refetchReports, isLoading: isLoadingReports} = useEventFeedbackReportsQuery();
  const {data: stats, refetch: refetchStats, isLoading: isLoadingStats} = useEventFeedbackStatsQuery();
  const refreshBoth = useCallback(async () => {
    await Promise.all([refetchReports(), refetchStats()]);
  }, [refetchReports, refetchStats]);
  const {refreshing, onRefresh} = useRefresh({refresh: refreshBoth});
  useAdminHelpButton(CommonStackComponents.eventFeedbackHelpScreen);

  const reportsWithIds = useMemo(
    () => (reports ?? []).filter((report): report is EventFeedbackReportWithId => !!report.id),
    [reports],
  );

  const renderItem = useCallback(({item}: {item: EventFeedbackReportWithId}) => {
    return <EventFeedbackReportListItem report={item} />;
  }, []);

  const renderListHeader = useCallback(() => {
    return (
      <>
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
        {reportsWithIds.length > 0 && <Divider bold={true} />}
      </>
    );
  }, [reportsWithIds.length, stats]);

  const renderListFooter = useCallback(() => {
    if (reportsWithIds.length > 0) {
      return <EndResultsFooter />;
    }
    return <NoResultsFooter />;
  }, [reportsWithIds.length]);

  const renderItemSeparator = useCallback(() => {
    return <Divider bold={true} />;
  }, []);

  const keyExtractor = useCallback((item: EventFeedbackReportWithId) => item.id, []);

  if ((isLoadingReports && !reports) || (isLoadingStats && !stats)) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <AppFlashList<EventFeedbackReportWithId>
        ref={listRef}
        data={reportsWithIds}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderListHeader={renderListHeader}
        renderListFooter={renderListFooter}
        renderItemSeparator={renderItemSeparator}
      />
    </AppView>
  );
};
