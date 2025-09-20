import React from 'react';
import {List} from 'react-native-paper';

import {SettingsStackScreenComponents, useSettingsStack} from '#src/Navigation/Stacks/SettingsStackNavigator';

export const SettingsLoginListItem = () => {
  const navigation = useSettingsStack();

  return (
    <List.Item
      title={'Login'}
      description={'Log in to your Twitarr account.'}
      onPress={() => navigation.push(SettingsStackScreenComponents.login)}
    />
  );
};
