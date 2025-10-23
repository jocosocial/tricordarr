import React from 'react';

import {SettingsNavigationListItem} from '#src/Components/Lists/Items/Settings/SettingsNavigationListItem';
import {SettingsStackScreenComponents} from '#src/Navigation/Stacks/SettingsStackNavigator';

export const SettingsRegistrationListItem = () => {

  return (
    <SettingsNavigationListItem
      title={'Register'}
      description={'Create a new Twitarr account.'}
      navComponent={SettingsStackScreenComponents.registerScreen}
    />
  );
};
