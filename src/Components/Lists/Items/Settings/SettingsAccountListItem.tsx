import React from 'react';

import {NavigationListItem} from '#src/Components/Lists/Items/NavigationListItem';
import {SettingsStackScreenComponents} from '#src/Navigation/Stacks/Settings/SettingsStackComponents';

/**
 * Used in the Settings list for the users current account.
 */
export const SettingsAccountListItem = () => {
  return (
    <NavigationListItem
      title={'Your Account'}
      description={'Manage your Twitarr account.'}
      navComponent={SettingsStackScreenComponents.accountManagement}
    />
  );
};
