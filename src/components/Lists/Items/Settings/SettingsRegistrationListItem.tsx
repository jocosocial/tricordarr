import {List} from 'react-native-paper';
import React from 'react';
import {useSettingsStack} from '../../../Navigation/Stacks/SettingsStack';
import {SettingsStackScreenComponents} from '../../../../libraries/Enums/Navigation';

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
