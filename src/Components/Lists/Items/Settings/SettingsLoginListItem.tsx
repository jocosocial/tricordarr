import React from 'react';

import {NavigationListItem} from '#src/Components/Lists/Items/NavigationListItem';
import {SettingsStackScreenComponents} from '#src/Navigation/Stacks/Settings/SettingsStackComponents';

export const SettingsLoginListItem = () => {
  return (
    <NavigationListItem
      title={'Login'}
      description={'Log in to your Twitarr account.'}
      navComponent={SettingsStackScreenComponents.login}
    />
  );
};
