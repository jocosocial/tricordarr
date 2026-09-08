import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useMemo} from 'react';

import {useModerationHeaderButtons} from '#src/Components/Buttons/HeaderButtons/ModerationHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {ModerationLogList} from '#src/Components/Lists/Moderation/ModerationLogList';
import {AppView} from '#src/Components/Views/AppView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {usePagination} from '#src/Hooks/usePagination';
import {useRefresh} from '#src/Hooks/useRefresh';
import {
  CommonStackComponents,
  CommonStackParamList,
  useCommonStack,
} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useModerationLogQuery} from '#src/Queries/Moderation/ModerationQueries';
import {ModeratorFeatureScreen} from '#src/Screens/Checkpoint/ModeratorFeatureScreen';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.moderatorLogScreen>;

const ModeratorLogScreenInner = () => {
  const navigation = useCommonStack();
  const {data, refetch, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage} = useModerationLogQuery();
  const {refreshing, setRefreshing, onRefresh} = useRefresh({refresh: refetch});
  const {handleLoadNext} = usePagination({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    setRefreshing,
  });
  const getNavButtons = useModerationHeaderButtons();

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  const actions = useMemo(() => data?.pages.flatMap(page => page.actions) ?? [], [data]);

  if (isLoading || !data) {
    return <LoadingView refreshing={refreshing} onRefresh={onRefresh} />;
  }

  return (
    <AppView>
      <ModerationLogList
        actions={actions}
        handleLoadNext={handleLoadNext}
        hasNextPage={hasNextPage}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </AppView>
  );
};

export const ModeratorLogScreen = (_props: Props) => {
  return (
    <ModeratorFeatureScreen>
      <ModeratorLogScreenInner />
    </ModeratorFeatureScreen>
  );
};
