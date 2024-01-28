import React from 'react';
import {List} from 'react-native-paper';
import {SettingsStackParamList, useSettingsStack} from '../../../Navigation/Stacks/SettingsStack';
import {SettingsStackScreenComponents} from '../../../../libraries/Enums/Navigation';

interface NavigationListItemProps {
  title: string;
  description: string;
  navComponent: keyof SettingsStackParamList;
}

export const SettingsNavigationListItem = ({title, description, navComponent}: NavigationListItemProps) => {
  const navigation = useSettingsStack();

  return (
    <List.Item title={title} description={description} onPress={() => navigation.push(navComponent)} />
  );
};
