import React, {useEffect} from 'react';

import {useAdminHeaderButtons} from '#src/Components/Buttons/HeaderButtons/AdminHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useRefresh} from '#src/Hooks/useRefresh';
import {useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useAdminRollupQuery} from '#src/Queries/Admin/RollupQueries';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {NoAccessScreen} from '#src/Screens/Checkpoint/NoAccessScreen';
import {ServerRollupCountType} from '#src/Structs/AdminControllerStructs';

export const AdminRollupScreen = () => {
  const {hasTwitarrTeam} = usePrivilege();
  return (
    <LoggedInScreen>
      <NoAccessScreen hasAccess={hasTwitarrTeam}>
        <AdminRollupScreenInner />
      </NoAccessScreen>
    </LoggedInScreen>
  );
};

const AdminRollupScreenInner = () => {
  const navigation = useCommonStack();
  const {data, refetch, isLoading} = useAdminRollupQuery();
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const getNavButtons = useAdminHeaderButtons();

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  if (isLoading && !data) {
    return (
      <AppView>
        <LoadingView />
      </AppView>
    );
  }

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <ListSection>
          <ListSubheader>Server Counts</ListSubheader>
        </ListSection>
        {ServerRollupCountType.all.map(countType => {
          const value = data?.counts[countType] ?? 0;
          return (
            <DataFieldListItem key={countType} title={ServerRollupCountType.getLabel(countType)} description={value} />
          );
        })}
      </ScrollingContentView>
    </AppView>
  );
};
