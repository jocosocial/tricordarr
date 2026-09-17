import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useMemo} from 'react';

import {useModerationHeaderButtons} from '#src/Components/Buttons/HeaderButtons/ModerationHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {ModerationReportsList} from '#src/Components/Lists/Moderation/ModerationReportsList';
import {AppView} from '#src/Components/Views/AppView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useReportContentGroup} from '#src/Hooks/Moderation/useReportContentGroup';
import {useRefresh} from '#src/Hooks/useRefresh';
import {isClosedReportsParam} from '#src/Libraries/Moderation/ModerationStateContext';
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
  const {groupsFromReports, filterByClosed} = useReportContentGroup();

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  const groups = useMemo(() => {
    if (!data) {
      return [];
    }
    return filterByClosed(groupsFromReports(data), showClosed);
  }, [data, showClosed, filterByClosed, groupsFromReports]);

  if (isLoading || !data) {
    return (
      <AppView>
        <LoadingView refreshing={refreshing} onRefresh={onRefresh} />
      </AppView>
    );
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
