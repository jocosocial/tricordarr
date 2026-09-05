import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useMemo} from 'react';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {ModerationReportsList} from '#src/Components/Lists/Moderation/ModerationReportsList';
import {AppView} from '#src/Components/Views/AppView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useModerationHelpHeader} from '#src/Hooks/useModerationHelpHeader';
import {useRefresh} from '#src/Hooks/useRefresh';
import {isClosedReportsParam} from '#src/Libraries/Moderation/ModerationStateContext';
import {ReportContentGroup} from '#src/Libraries/Moderation/ReportContentGroup';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useModerationReportsQuery} from '#src/Queries/Moderation/ModerationQueries';
import {ModeratorFeatureScreen} from '#src/Screens/Checkpoint/ModeratorFeatureScreen';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.moderatorReportsScreen>;

const ModeratorReportsScreenInner = ({route}: Props) => {
  const {data, refetch, isLoading} = useModerationReportsQuery();
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  useModerationHelpHeader();
  const showClosed = isClosedReportsParam(route.params.closed);

  const groups = useMemo(() => {
    if (!data) {
      return [];
    }
    return ReportContentGroup.filterByClosed(ReportContentGroup.groupsFromReports(data), showClosed);
  }, [data, showClosed]);

  if (isLoading || !data) {
    return <LoadingView refreshing={refreshing} onRefresh={onRefresh} />;
  }

  return (
    <AppView>
      <ModerationReportsList
        groups={groups}
        showUnread={!showClosed}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </AppView>
  );
};

export const ModeratorReportsScreen = (props: Props) => {
  return (
    <ModeratorFeatureScreen>
      <ModeratorReportsScreenInner {...props} />
    </ModeratorFeatureScreen>
  );
};
