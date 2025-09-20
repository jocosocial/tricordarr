import React from 'react';
import {List} from 'react-native-paper';

import {SettingsStackScreenComponents, useSettingsStack} from '#src/Navigation/Stacks/SettingsStackNavigator';

/**
 * Used in the Settings list for the users current account.
 */
export const SettingsAccountListItem = () => {
  const navigation = useSettingsStack();

  return (
    <List.Item
      title={'Your Account'}
      description={'Manage your Twitarr account.'}
      onPress={() => navigation.push(SettingsStackScreenComponents.accountManagement)}
    />
  );
};
