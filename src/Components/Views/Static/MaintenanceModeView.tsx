import React, {useState} from 'react';

import {MaintenanceModeCard} from '#src/Components/Cards/MaintenanceModeCard';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useClientSettings} from '#src/Context/Contexts/ClientSettingsContext';

/**
 * Shown when the server is in maintenance mode and the current user doesn't meet the
 * configured minimum access level. Pull-to-refresh only re-checks the client settings endpoint.
 */
export const MaintenanceModeView = () => {
  const {updateClientSettings} = useClientSettings();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await updateClientSettings();
    setRefreshing(false);
  };

  return (
    <AppView disableMinAccessLevelWarning={true}>
      <ScrollingContentView
        isStack={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <PaddedContentView padTop={true}>
          <MaintenanceModeCard />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
