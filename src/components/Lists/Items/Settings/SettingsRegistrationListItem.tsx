import {List} from 'react-native-paper';
import React from 'react';
import {SettingsStackScreenComponents, useSettingsStack} from '#src/Components/Navigation/Stacks/SettingsStackNavigator.tsx';

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
