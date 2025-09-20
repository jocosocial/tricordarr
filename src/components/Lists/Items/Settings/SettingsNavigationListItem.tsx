import React from 'react';
import {List} from 'react-native-paper';
import {SettingsStackParamList, useSettingsStack} from '#src/Components/Navigation/Stacks/SettingsStackNavigator.tsx';

interface NavigationListItemProps {
  title: string;
  description: string;
  navComponent: keyof SettingsStackParamList;
}

export const SettingsNavigationListItem = ({title, description, navComponent}: NavigationListItemProps) => {
  const navigation = useSettingsStack();

  return <List.Item title={title} description={description} onPress={() => navigation.push(navComponent)} />;
};
