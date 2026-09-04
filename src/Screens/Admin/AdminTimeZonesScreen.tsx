import React from 'react';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useAdminAccess} from '#src/Hooks/Admin/useAdminAccess';
import {useAdminHelpButton} from '#src/Hooks/Admin/useAdminHelpButton';
import {useRefresh} from '#src/Hooks/useRefresh';
import {alertReloadTimeZones} from '#src/Libraries/Alerts/AdminAlerts';
import {useReloadTimeZoneDataMutation} from '#src/Queries/Admin/TimeZoneMutations';
import {useTimeZoneChangesQuery} from '#src/Queries/Admin/TimeZoneQueries';
import {AdminAccessScreen} from '#src/Screens/Checkpoint/AdminAccessScreen';

export const AdminTimeZonesScreen = () => {
  return (
    <AdminAccessScreen minAccess={'twitarrteam'}>
      <AdminTimeZonesScreenInner />
    </AdminAccessScreen>
  );
};

const AdminTimeZonesScreenInner = () => {
  const {data, refetch, isLoading} = useTimeZoneChangesQuery({enabled: true});
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const reloadMutation = useReloadTimeZoneDataMutation();
  const {canReloadTimeZones} = useAdminAccess();
  const {setSnackbarPayload} = useSnackbar();
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
          <ListSubheader>Current</ListSubheader>
        </ListSection>
        <DataFieldListItem title={'Abbreviation'} description={data?.currentTimeZoneAbbrev} />
        <DataFieldListItem title={'Time Zone ID'} description={data?.currentTimeZoneID} />
        <DataFieldListItem title={'UTC Offset (seconds)'} description={data?.currentOffsetSeconds} />
        <ListSection>
          <ListSubheader>Scheduled Changes</ListSubheader>
        </ListSection>
        {data?.records.map((record, index) => (
          <DataFieldListItem
            key={`${record.timeZoneID}-${index}`}
            title={`${record.timeZoneID} (${record.timeZoneAbbrev})`}
            description={new Date(record.activeDate).toISOString()}
          />
        ))}
        {canReloadTimeZones && (
          <PaddedContentView padTop={true}>
            <PrimaryActionButton
              testID={'reloadTz-button'}
              buttonText={'Reload Time Zone Seed File'}
              onPress={() =>
                alertReloadTimeZones(() =>
                  reloadMutation.mutate(undefined, {
                    onSuccess: () => {
                      setSnackbarPayload({message: 'Time zone data reloaded.', messageType: 'success'});
                      refetch();
                    },
                  }),
                )
              }
              isLoading={reloadMutation.isPending}
            />
          </PaddedContentView>
        )}
      </ScrollingContentView>
    </AppView>
  );
};
