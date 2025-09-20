import React from 'react';
import {List} from 'react-native-paper';

import {SettingsStackScreenComponents, useSettingsStack} from '#src/Navigation/Stacks/SettingsStackNavigator';

export const SettingsRegistrationListItem = () => {
  const navigation = useSettingsStack();

  return (
    <List.Item
      title={'Register'}
      description={'Create a new Twitarr account.'}
      onPress={() => navigation.push(SettingsStackScreenComponents.registerScreen)}
    />
  );
};
