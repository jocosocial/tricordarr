import React from 'react';

import {SettingsNavigationListItem} from '#src/Components/Lists/Items/Settings/SettingsNavigationListItem';
import {SettingsStackScreenComponents} from '#src/Navigation/Stacks/SettingsStackNavigator';

/**
 * Used in the Settings list for the users current account.
 */
export const SettingsAccountListItem = () => {
  return (
    <SettingsNavigationListItem
      title={'Your Account'}
      description={'Manage your Twitarr account.'}
      navComponent={SettingsStackScreenComponents.accountManagement}
    />
  );
};
