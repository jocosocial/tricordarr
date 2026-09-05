import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useMemo} from 'react';

import {useModerationHeaderButtons} from '#src/Components/Buttons/HeaderButtons/ModerationHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {ModerationReportsList} from '#src/Components/Lists/Moderation/ModerationReportsList';
import {AppView} from '#src/Components/Views/AppView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useRefresh} from '#src/Hooks/useRefresh';
import {isClosedReportsParam} from '#src/Libraries/Moderation/ModerationStateContext';
import {ReportContentGroup} from '#src/Libraries/Moderation/ReportContentGroup';
import {
  CommonStackComponents,
  CommonStackParamList,
  useCommonStack,
} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useModerationReportsQuery} from '#src/Queries/Moderation/ModerationQueries';
import {ModeratorFeatureScreen} from '#src/Screens/Checkpoint/ModeratorFeatureScreen';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.moderatorReportsScreen>;

const ModeratorReportsScreenInner = ({route}: Props) => {
  const navigation = useCommonStack();
  const {data, refetch, isLoading} = useModerationReportsQuery();
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const getNavButtons = useModerationHeaderButtons();
  const showClosed = isClosedReportsParam(route.params.closed);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

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
