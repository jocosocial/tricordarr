import React from 'react';

import {SettingsNavigationListItem} from '#src/Components/Lists/Items/Settings/SettingsNavigationListItem';
import {SettingsStackScreenComponents} from '#src/Navigation/Stacks/SettingsStackNavigator';

export const SettingsLoginListItem = () => {
  return (
    <SettingsNavigationListItem
      title={'Login'}
      description={'Log in to your Twitarr account.'}
      navComponent={SettingsStackScreenComponents.login}
    />
  );
};
