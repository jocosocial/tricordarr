import React, {useEffect} from 'react';

import {useAdminHeaderButtons} from '#src/Components/Buttons/HeaderButtons/AdminHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useRefresh} from '#src/Hooks/useRefresh';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useRegCodeStatsQuery} from '#src/Queries/Admin/RegCodeQueries';
import {AdminAccessScreen} from '#src/Screens/Checkpoint/AdminAccessScreen';

/**
 * Registration-code usage counts. Opened from the Registration Codes header Stats button.
 */
export const AdminRegCodeStatsScreen = () => {
  return (
    <AdminAccessScreen minAccess={'accountmanager'}>
      <AdminRegCodeStatsScreenInner />
    </AdminAccessScreen>
  );
};

const AdminRegCodeStatsScreenInner = () => {
  const navigation = useCommonStack();
  const {data: stats, refetch, isLoading} = useRegCodeStatsQuery();
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const getNavButtons = useAdminHeaderButtons(CommonStackComponents.registrationCodeHelpScreen);

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
          <DataFieldListItem title={'Allocated'} description={stats?.allocatedCodes} />
          <DataFieldListItem title={'Used'} description={stats?.usedCodes} />
          <DataFieldListItem title={'Unused'} description={stats?.unusedCodes} />
          <DataFieldListItem title={'Discord Allocated'} description={stats?.allocatedDiscordCodes} />
          <DataFieldListItem title={'Discord Assigned'} description={stats?.assignedDiscordCodes} />
          <DataFieldListItem title={'Discord Used'} description={stats?.usedDiscordCodes} />
        </ListSection>
      </ScrollingContentView>
    </AppView>
  );
};
