import React, {useEffect} from 'react';

import {useAdminHeaderButtons} from '#src/Components/Buttons/HeaderButtons/AdminHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useRefresh} from '#src/Hooks/useRefresh';
import {getEventFeedbackResponseRate} from '#src/Libraries/Admin/EventFeedbackCsv';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useEventFeedbackStatsQuery} from '#src/Queries/Admin/EventFeedbackQueries';
import {AdminAccessScreen} from '#src/Screens/Checkpoint/AdminAccessScreen';

/**
 * Shadow event and feedback response statistics for TwitarrTeam.
 */
export const AdminEventFeedbackStatsScreen = () => {
  return (
    <AdminAccessScreen minAccess={'twitarrteam'}>
      <AdminEventFeedbackStatsScreenInner />
    </AdminAccessScreen>
  );
};

const AdminEventFeedbackStatsScreenInner = () => {
  const navigation = useCommonStack();
  const {data: stats, refetch, isLoading} = useEventFeedbackStatsQuery();
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const getNavButtons = useAdminHeaderButtons(CommonStackComponents.eventFeedbackHelpScreen, {mode: 'admin'});

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  if (isLoading && !stats) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <ListSection>
          <DataFieldListItem title={'Total Shadow Events on Sched'} description={stats?.totalShadowEvents} />
          <DataFieldListItem title={'Completed Shadow Events'} description={stats?.completedShadowEvents} />
          <DataFieldListItem title={'Feedback Received'} description={stats?.totalFeedbackReports} />
          <DataFieldListItem title={'Unique Events with Feedback'} description={stats?.uniqueEventsWithFeedback} />
          {stats && <DataFieldListItem title={'Response Rate'} description={getEventFeedbackResponseRate(stats)} />}
        </ListSection>
      </ScrollingContentView>
    </AppView>
  );
};
