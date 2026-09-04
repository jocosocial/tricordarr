import React from 'react';

import {NavigationListItem} from '#src/Components/Lists/Items/NavigationListItem';
import {SettingsStackScreenComponents} from '#src/Navigation/Stacks/Settings/SettingsStackComponents';

export const SettingsRegistrationListItem = () => {
  return (
    <NavigationListItem
      title={'Register'}
      description={'Create a new Twitarr account.'}
      navComponent={SettingsStackScreenComponents.registerScreen}
    />
  );
};
