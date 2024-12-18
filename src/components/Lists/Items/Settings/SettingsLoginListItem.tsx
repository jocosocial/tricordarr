import {List} from 'react-native-paper';
import React from 'react';
import {SettingsStackScreenComponents, useSettingsStack} from '../../../Navigation/Stacks/SettingsStackNavigator.tsx';

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
