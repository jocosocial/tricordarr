import React from 'react';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useAdminHelpButton} from '#src/Hooks/Admin/useAdminHelpButton';
import {useRefresh} from '#src/Hooks/useRefresh';
import {useAdminRollupQuery} from '#src/Queries/Admin/RollupQueries';
import {AdminAccessScreen} from '#src/Screens/Checkpoint/AdminAccessScreen';
import {ServerRollupCountType} from '#src/Structs/AdminControllerStructs';

export const AdminRollupScreen = () => {
  return (
    <AdminAccessScreen minAccess={'twitarrteam'}>
      <AdminRollupScreenInner />
    </AdminAccessScreen>
  );
};

const AdminRollupScreenInner = () => {
  const {data, refetch, isLoading} = useAdminRollupQuery();
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  useAdminHelpButton();

  if (isLoading && !data) {
    return <LoadingView />;
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
          const value = data?.counts[countType];
          if (value === undefined) {
            return null;
          }
          return (
            <DataFieldListItem key={countType} title={ServerRollupCountType.getLabel(countType)} description={value} />
          );
        })}
      </ScrollingContentView>
    </AppView>
  );
};
