import React from 'react';

import {ListItem} from '#src/Components/Lists/ListItem';
import {SettingsStackParamList, useSettingsStack} from '#src/Navigation/Stacks/SettingsStackNavigator';

interface NavigationListItemProps {
  title: string;
  description: string;
  navComponent: keyof SettingsStackParamList;
}

export const SettingsNavigationListItem = ({title, description, navComponent}: NavigationListItemProps) => {
  const navigation = useSettingsStack();

  return (
    <ListItem
      title={title}
      description={description}
      onPress={() => (navigation.push as (name: keyof SettingsStackParamList) => void)(navComponent)}
    />
  );
};
